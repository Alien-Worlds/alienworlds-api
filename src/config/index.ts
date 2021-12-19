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

import Config from "./config";

const config = new Config();

export default config;