#!/usr/bin/env node

import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { storeAbisByAccount } from './store-abis-by-account';

(async () => {
  const directory = process.argv.length > 2 ? process.argv[2] : './abis';

  if (!existsSync(directory)) {
    await mkdir(directory, { recursive: true }).catch(console.error);
  }

  await storeAbisByAccount('m.federation', directory);
  await storeAbisByAccount('atomicassets', directory);
  console.log('Done!');
})();
