import dotenv from 'dotenv-safe';
dotenv.config({ allowEmptyValues: true });

export interface ConfigType {
  processor_threads: string;
  blockrange_threads: string;
  ship_endpoints: string[];
  chain_id: string;
  eosio_endpoints: string[];
  mining_contract: string;
  bsc_endpoint: string;
  eth_endpoint: string;
  bsc_token_contract: string;
  eth_token_contract: string;
  aw_api: {
    host: string;
    port: string;
    schemes: string[]; // one or both of: http, https
    docs: string;
  };
  amq: {
    connection_string: string;
  };
  mongo: {
    url: string;
    dbName: string;
  };
  atomicassets: {
    contract: string;
    collection: string;
  };
}

export const config: ConfigType = {
  processor_threads: process.env.PROCESSOR_THREADS, // number of threads for filler process, 0 = number of cores - 4
  blockrange_threads: process.env.BLOCKRANGE_THREADS, // number of threads for blockrange process, 0 = number of cores - 4
  ship_endpoints: JSON.parse(process.env.SHIP_ENDPOINTS),
  chain_id: process.env.CHAIN_ID,
  eosio_endpoints: JSON.parse(process.env.EOSIO_ENDPOINTS),
  mining_contract: process.env.MINING_CONTRACT,
  bsc_endpoint: process.env.BSC_ENDPOINT,
  eth_endpoint: process.env.ETH_ENDPOINT,
  bsc_token_contract: process.env.BSC_TOKEN_CONTRACT,
  eth_token_contract: process.env.ETH_TOKEN_CONTRACT,
  // start_block: parseInt(process.env.EOSIO_START_BLOCK),
  aw_api: {
    host: process.env.AW_API_HOST,
    port: process.env.AW_API_PORT,
    schemes: JSON.parse(process.env.AW_API_SCHEMES), // one or both of: http, https
    docs: process.env.AW_DOC_HOST,
  },
  amq: {
    connection_string: process.env.AMQ_CONNECTION_STRING,
  },
  mongo: {
    url: process.env.MONGO_URL,
    dbName: process.env.MONGO_DB_NAME,
  },
  atomicassets: {
    contract: process.env.ATOMICASSETS_CONTRACT,
    collection: process.env.AW_COLLECTION,
  },
};
