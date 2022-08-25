#!/usr/bin/env node
/* istanbul ignore file */

process.title = 'alienworlds-api';

import { buildAPI } from './api';
import { config } from '@config';

const start = async () => {
  try {
    const api = await buildAPI();
    await api.listen(config.port, config.host);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();
