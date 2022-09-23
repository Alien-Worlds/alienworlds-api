module.exports = {
    processor_threads: 0, // number of threads for filler process, 0 = number of cores - 4
    blockrange_threads: 0, // number of threads for blockrange process, 0 = number of cores - 4
    ship_endpoints: ['ws://ship.alienworlds.io:28080/'],
    chain_id: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
    endpoints: ["https://wax.eosdac.io"],
    mining_contract: 'm.federation',
    notify_contract: 'notify.world',
    bsc_endpoint: '',
    eth_endpoint: '',
    bsc_token_contract: '',
    eth_token_contract: '',
    start_block: 93613945, // m.federation genesis block 93613945, atomicassets genesis = 64105503
    api: {
        host: '0.0.0.0',
        port: 8800,
        schemes: ['https', 'http'] // one or both of: http, https
    },
    amq: {
        connection_string: 'amqp://guest:guest@queue/'
    },
    mongo: {
        url: 'mongodb://db',
        dbName: 'alienworlds_mainnet',
    },
    atomicassets: {
        contract: 'atomicassets',
        collection: 'alien.worlds'
    }
}
