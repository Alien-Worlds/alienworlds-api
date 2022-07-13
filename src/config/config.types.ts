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

export type BlockRangeScanConfig = {
  fillerClusterSize: number;
  blockRangeClusterSize: number;
  numberOfChildren: number;
  minChunkSize: number;
  scanKey: string;
};

export type Config = {
  blockRangeScan: BlockRangeScanConfig;
  host: string;
  port: number;
  schemes: string[];
  processorThreads: number;
  processorInviolableThreads: number;
  blockrangeThreads: number;
  blockrangeInviolableThreads: number;
  shipEndpoints: string[];
  chainId: string;
  endpoints: string[];
  miningContract: string;
  bscEndpoint: string;
  ethEndpoint: string;
  bscTokenContract: string;
  ethTokenContract: string;
  startBlock: bigint | number;
  endBlock: bigint | number;
  amqConnectionString: string;
  atomicAssets: AtomicAssetsConfig;
  mongo: MongoConfig;
  docs: DocsConfig;
  abisPath: string;
  processorMessageHandlerCount: number;
  mineRepositoryCacheMaxSize: number;
};
