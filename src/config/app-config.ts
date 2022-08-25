import { Config, DocsConfig, MongoConfig } from './config.types';

export default class AppConfig implements Config {
  constructor(
    public readonly host: string = process.env.HOST,
    public readonly port: number = Number(process.env.PORT),
    public readonly schemes: string[] = process.env.SCHEMES.split(' '),
    public readonly chainId: string = process.env.CHAIN_ID,
    public readonly endpoints: string[] = process.env.ENDPOINTS.split(' '),
    public readonly miningContract: string = process.env.MINING_CONTRACT,
    public readonly bscEndpoint: string = process.env.BSC_ENDPOINT,
    public readonly ethEndpoint: string = process.env.ETH_ENDPOINT,
    public readonly bscTokenContract: string = process.env.BSC_TOKEN_CONTRACT,
    public readonly ethTokenContract: string = process.env.ETH_TOKEN_CONTRACT,
    public readonly mongo: MongoConfig = {
      url: process.env.MONGO_URL,
      dbName: process.env.MONGO_DB_NAME,
    },
    public readonly docs: DocsConfig = {
      host: process.env.DOCS_HOST,
      routePrefix: process.env.DOCS_ROUTE_PREFIX,
      exposeRoute: Boolean(process.env.DOCS_EXPOSE_ROUTE),
    }
  ) {}
}
