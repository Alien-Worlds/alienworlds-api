import { tokenSchema } from '../schemas'
import fetch from 'node-fetch'
import { ethers } from 'ethers'
const config = require('../config')

const bsc_provider = new ethers.providers.JsonRpcProvider(config.bsc_endpoint)
const eth_provider = new ethers.providers.JsonRpcProvider(config.eth_endpoint)

const erc_abi = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "type": "function"
    }
]

const get_wax_balance = async (account) => {
    const url = `${config.endpoints[0]}/v1/chain/get_currency_balance`
    const req_data = {
        account,
        code: 'alien.worlds',
        symbol: 'TLM'
    }

    const res = await fetch(url, {
        method: 'POST',
        body:    JSON.stringify(req_data),
        headers: { 'Content-Type': 'application/json' },
    })
    const json = await res.json()

    if (!json.length){
        return 0
    }

    const [bal_str] = json[0].split(' ')

    return parseFloat(bal_str)
}

const get_eth_balance = async (address) => {
    const contract = new ethers.Contract(config.eth_token_contract, erc_abi, eth_provider);
    const balance = await contract.balanceOf(address);

    return balance.toNumber() / 10000
}

const get_bsc_balance = async (address) => {
    const contract = new ethers.Contract(config.bsc_token_contract, erc_abi, bsc_provider);
    const balance = await contract.balanceOf(address);

    return balance.toNumber() / 10000
}

const getTokenSupplies = async (fastify, request) => {
    // const stats =

    const exclude_accounts_wax = [
        'team.worlds',
        'ghub.worlds',
        'fndtn.worlds',
        'oper2.worlds',
        'mm.worlds',
        'anim.worlds',
        'oper3.worlds',
        'oper1.worlds',
        'call.worlds',
        'secureplus24',
        'sixpepvamshi',
        'iamababygirl',
        'careforchild',
        'doctormanasa',
        'emahalakshmi',
        'helloashwath',
        'idwarakaravi',
        'itstharshita',
        'mrsuryapavan',
        'realshirisha',
        'sriramsurya2',
        'thereallatha',
        'kavian.world',
        'neri.world',
        'magor.world',
        'open.worlds',
        'eyeke.world',
        'veles.world'
    ]
    const exclude_accounts_eth = [
        '0xa0ea3f87922810c012db706e247636c71868ffbb',
        '0x3333336d579a0107849eb68c9f1c0b92d48c2889'
    ]
    const exclude_accounts_bsc = [
        '0x5903b5f7eb3733fec8477be1b0a0fd149b33b547'
    ]

    // console.log(fetch, config)
    console.log(request.query.type)
    const url = `${config.endpoints[0]}/v1/chain/get_currency_stats`
    const req_data = {
        json: true,
        code: 'alien.worlds',
        symbol: 'TLM'
    }

    const res = await fetch(url, {
        method: 'POST',
        body:    JSON.stringify(req_data),
        headers: { 'Content-Type': 'application/json' },
    })
    const json = await res.json()
    // console.log(json)
    const supply = json.TLM.supply.replace(' TLM', '')

    let circulating = parseFloat(supply);
    const balance_promises = [];
    for (let exclude_account of exclude_accounts_wax){
        balance_promises.push(get_wax_balance(exclude_account))
    }
    for (let exclude_account of exclude_accounts_eth){
        balance_promises.push(get_eth_balance(exclude_account))
    }
    for (let exclude_account of exclude_accounts_bsc){
        balance_promises.push(get_bsc_balance(exclude_account))
    }

    const balances = await Promise.all(balance_promises)
    balances.forEach(b => {
        circulating -= b
    })

    if (request.query.type === 'circulating'){
        return '128488577'.toFixed(4)
        // return circulating.toFixed(4)
    }
    else if (request.query.type === 'supply'){
        return supply
    }
    else {
        return 'Invalid type'
    }
}


export default function (fastify, opts, next) {
    fastify.get('/token', {
        schema: tokenSchema.GET
    }, async (request, reply) => {
        const res = await getTokenSupplies(fastify, request)
        reply.send(res)
    });
    next()
}
