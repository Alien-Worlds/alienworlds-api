#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');

let environment;
let arg = process.argv[2];

if (arg) {
  environment = arg.toLowerCase().replace(/-/g, '');
} else if (process.env.NODE_ENV) {
  environment = process.env.NODE_ENV;
} else {
  environment = '';
}

const path =
  environment.includes('prod') || environment === ''
    ? '.env'
    : `.env-${environment}`;

try {
  fs.copyFileSync(`${__dirname}/env_template`, path);
  console.log('env file created', path);
  process.exit(0);
} catch (err) {
  process.exit(1);
}
