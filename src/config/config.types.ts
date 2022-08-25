export type MongoConfig = {
  url: string;
  dbName: string;
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
  chainId: string;
  endpoints: string[];
  miningContract: string;
  bscEndpoint: string;
  ethEndpoint: string;
  bscTokenContract: string;
  ethTokenContract: string;
  mongo: MongoConfig;
  docs: DocsConfig;
};
