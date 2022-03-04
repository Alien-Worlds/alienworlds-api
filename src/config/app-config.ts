/* eslint-disable no-unused-vars */
import {
  AtomicAssetsConfig,
  Config,
  DocsConfig,
  MongoConfig,
} from './config.types';

export default class AppConfig implements Config {
  constructor(
    public readonly host: string = process.env.HOST,
    public readonly port: number = Number(process.env.PORT),
    public readonly schemes: string[] = process.env.SCHEMES.split(' '),
    public readonly processorThreads: number = Number(
      process.env.PROCESSOR_THREADS
    ),
    public readonly blockrangeThreads: number = Number(
      process.env.BLOCKRANGE_THREADS
    ),
    public readonly shipEndpoints: string[] = process.env.SHIP_ENDPOINTS.split(
      ' '
    ),
    public readonly chainId: string = process.env.CHAIN_ID,
    public readonly endpoints: string[] = process.env.ENDPOINTS.split(' '),
    public readonly miningContract: string = process.env.MINING_CONTRACT,
    public readonly bscEndpoint: string = process.env.BSC_ENDPOINT,
    public readonly ethEndpoint: string = process.env.ETH_ENDPOINT,
    public readonly bscTokenContract: string = process.env.BSC_TOKEN_CONTRACT,
    public readonly ethTokenContract: string = process.env.ETH_TOKEN_CONTRACT,
    public readonly startBlock: number = Number(process.env.START_BLOCK),
    public readonly endBlock: number = Number(process.env.END_BLOCK),
    public readonly amqConnectionString: string = process.env
      .AMQ_CONNECTION_STRING,
    public readonly atomicAssets: AtomicAssetsConfig = {
      contract: process.env.ATOMIC_ASSETS_CONTRACT,
      collection: process.env.ATOMIC_ASSETS_COLLECTION,
    },
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
