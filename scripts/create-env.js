#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const nodeEnv = process.env.NODE_ENV;

try {
  fs.copyFileSync(
    `${__dirname}/env_template`,
    nodeEnv ? `./.env-${nodeEnv}` : `./.env`
  );
  process.exit(0);
} catch (err) {
  process.exit(1);
}
