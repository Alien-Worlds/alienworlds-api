import * as dotenv from "dotenv";
import Config from "./config";

console.log(process.env.NODE_ENV);

dotenv.config();
let path;
switch (process.env.NODE_ENV) {
  case "test":
    path = `${__dirname}/../../.env.test`;
    break;
  case "production":
    path = `${__dirname}/../../.env.production`;
    break;
  default:
    path = `${__dirname}/../../.env.develop`;
}
dotenv.config({ path: path });

const config = new Config();

export default config;