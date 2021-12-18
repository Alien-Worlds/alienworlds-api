#!/usr/bin/env node

process.title = 'eosdac-api';

import config from './config';
import { buildAPI } from './api';

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