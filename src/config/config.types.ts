export type MongoConfig = {
  url: string;
  dbName: string;
};

export type AtomicAssetsConfig = {
  contract: string;
  collection: string;
};

export type DocsConfig = {
  host: string;
  routePrefix: string;
  exposeRoute: boolean;
};

export type Config = {
  host: string;
  port: number;
  schemes: string[];
  processorThreads: number;
  blockrangeThreads: number;
  shipEndpoints: string[];
  chainId: string;
  endpoints: string[];
  miningContract: string;
  bscEndpoint: string;
  ethEndpoint: string;
  bscTokenContract: string;
  ethTokenContract: string;
  startBlock: number;
  amqConnectionString: string;
  atomicAssets: AtomicAssetsConfig;
  mongo: MongoConfig
  docs: DocsConfig;
}
