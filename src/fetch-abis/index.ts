#!/usr/bin/env node
import { storeAbisByAccount } from './store-abis-by-account';

(async () => {
  const directory = process.argv.length > 2 ? process.argv[2] : './abis';
  await storeAbisByAccount('m.federation', directory);
  await storeAbisByAccount('atomicassets', directory);
  console.log('Done!');
})();
