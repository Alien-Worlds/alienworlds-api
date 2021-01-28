const connectMongo = require('./connections/mongo');


(async () => {
    const config = require(`./config`);

    const mongo = await connectMongo(config.mongo);

    const mines_collection = mongo.collection('mines');
    const mines_global_ind = await mines_collection.createIndex({ global_sequence: 1 }, { unique: true });

    const nfts_collection = mongo.collection('nfts');
    const nfts_global_ind = await nfts_collection.createIndex({ global_sequence: 1 }, { unique: true });

    const assets_collection = mongo.collection('assets');
    const assets_global_ind = await assets_collection.createIndex({ data_hash: 1, block_num: 1, present: 1 }, { unique: true });

    process.exit(0);
})();
