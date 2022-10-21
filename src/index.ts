#!/usr/bin/env node
/* istanbul ignore file */
import 'reflect-metadata';

process.title = 'alienworlds-api';

import { buildAPI } from './api';
import { config } from './config';
import { Container } from '@alien-worlds/api-core';

const start = async () => {
  try {
    const ioc = new Container();
    const api = await buildAPI(ioc);
    await api.listen(config.port, config.host);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();
