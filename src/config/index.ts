let path;
switch (process.env.NODE_ENV) {
  case "test":
    path = `${__dirname}/../../.env-test`;
    break;
  case "production":
    path = `${__dirname}/../../.env-production`;
    break;
  default:
    path = `${__dirname}/../../.env-develop`;
}
require('dotenv').config({ path: path });

import { Config } from "./config.types";
import AppConfig from "./app-config";

console.log('__dirname:', __dirname);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('HOST:', process.env.HOST);

const config: Config = new AppConfig();

export default config;

export { Config } from "./config.types";