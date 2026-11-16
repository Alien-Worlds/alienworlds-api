// Config for the smoke harness. Every endpoint points at a container on the
// internal network; nothing here reaches the internet.
module.exports = {
  processor_threads: 0,
  blockrange_threads: 0,
  ship_endpoints: ['ws://mock-chain:8080'],
  chain_id: '0000000000000000000000000000000000000000000000000000000000000000',
  endpoints: ['http://mock-chain:8080'],
  mining_contract: 'm.federation',
  notify_contract: 'notify.world',
  abi_fetch_contracts: [],
  hyperion_endpoint: 'http://mock-chain:8080',
  bsc_endpoint: 'http://mock-chain:8080/',
  eth_endpoint: 'http://mock-chain:8080/',
  bsc_token_contract: '0x0000000000000000000000000000000000000001',
  eth_token_contract: '0x0000000000000000000000000000000000000002',
  start_block: 1,
  api: { host: '0.0.0.0', port: 8800, schemes: ['http'] },
  amq: { connection_string: 'amqp://unused' },
  mongo: { url: 'mongodb://mongo:27017', dbName: 'smoke' },
  atomicassets: { contract: 'atomicassets', collection: 'alien.worlds' },
};
