#!/usr/bin/env node

/*
gets all the abis
 */

const fetch_abis = async () => {
    const fetch = require('node-fetch');
    const fs = require('fs');
    const contracts = ['m.federation', 'atomicassets'];

    for (let c = 0; c < contracts.length; c++){
        const contract = contracts[c];

        console.log(`Getting abi actions for ${contract}`);
        const url = `https://api.waxsweden.org/v2/history/get_actions?account=${contract}&filter=eosio:setabi&limit=100&sort=1`;
        const res = await fetch(url);
        const json = await res.json();
        for (let i = 0; i < json.actions.length; i++){
            const act = json.actions[i];
            const filename = `abis/${contract}-${act.block_num}.hex`;
            fs.writeFileSync(filename, act.act.data.abi);
            console.log(`Wrote ${filename}`);
            // console.log(act.timestamp, act.block_num, act.act.data.abi);
        }
    }
}

fetch_abis();
