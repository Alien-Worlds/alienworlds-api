#!/usr/bin/env node

/*
gets all the abis
 */

const fetch_abis = async directory => {
  const fetch = require('node-fetch');
  const fs = require('fs');
  const contracts = ['m.federation', 'atomicassets'];

  for (let c = 0; c < contracts.length; c++) {
    const contract = contracts[c];

    console.log(`Getting abi actions for ${contract} into ${directory}`);
    const url = `https://api.waxsweden.org/v2/history/get_actions?account=${contract}&filter=eosio:setabi&limit=100&sort=1`;
    const res = await fetch(url);
    const json = await res.json();
    for (let i = 0; i < json.actions.length; i++) {
      const act = json.actions[i];
      const filename = `${directory}/${contract}-${act.block_num}.hex`;
      fs.writeFileSync(filename, act.act.data.abi);
      console.log(`Wrote ${filename}`);
      // console.log(act.timestamp, act.block_num, act.act.data.abi);
    }
  }
};

(() => {
  let directory = './abis';
  if (process.argv.length > 2) {
    directory = process.argv[2];
  }
  fetch_abis(directory);
})();
