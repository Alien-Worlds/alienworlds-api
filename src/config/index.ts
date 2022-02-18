/* eslint-disable @typescript-eslint/no-var-requires */
import { existsSync, statSync } from 'fs';
import AppConfig from './app-config';

const envPath = process.env.NODE_ENV
  ? `./.env-${process.env.NODE_ENV}`
  : `./.env`;

if (!existsSync(envPath)) {
  throw new Error(
    `Configuration file not found. Please check path: ${envPath}`
  );
}

const envStats = statSync(envPath);

if (!envStats.isFile()) {
  throw new Error(
    `The given path is not a file. Please check path: ${envPath}`
  );
}

require('dotenv').config({ path: envPath });

export default new AppConfig();
export { Config } from './config.types';
