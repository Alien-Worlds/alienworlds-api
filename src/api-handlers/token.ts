import { tokenSchema } from '../schemas'
import fetch from 'node-fetch'
const config = require('../config')

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
        'kavian.world',
        'neri.world',
        'magor.world',
        'open.worlds',
        'eyeke.world',
        'veles.world'
    ]
    const exclude_accounts_eth = [
        '0xa0ea3f87922810c012db706e247636c71868ffbb',
        '0x3333336d579a0107849eb68c9f1c0b92d48c2889',
        '0xdfcf7aa08c9cc0549a94396a0fa156feda987ff6',
        '0xa15b9b9581a3746db297cbe28cf15bd239637b78'
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

    if (request.query.type === 'circulating'){
        return '1240473079.0000'
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
