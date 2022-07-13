#!/usr/bin/env node
import { config } from '@config';
import { storeAbisByAccount } from './store-abis-by-account';

(async () => {
  const directory = process.argv.length > 2 ? process.argv[2] : config.abisPath;
  await storeAbisByAccount('m.federation', directory);
  await storeAbisByAccount('atomicassets', directory);
  console.log('Done!');
})();
