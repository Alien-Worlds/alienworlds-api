#!/usr/bin/env node

import { connectMongo } from './connections/mongo'

(async () => {
    const config = require(`./config`);

    const mongo: any = await connectMongo(config.mongo);
    console.log('Connected to mongo')

    const mines_collection = mongo.collection('mines');
    console.log('Creating mines:global_sequence index')
    const mines_global_ind = await mines_collection.createIndex({ global_sequence: 1 }, { unique: true, background: true });
    console.log('Creating mines:miners index')
    const mines_miners_ind = await mines_collection.createIndex({ miner: 1, global_sequence: -1 }, {background: true});
    console.log('Creating mines:land_id index')
    const mines_land_id_ind = await mines_collection.createIndex({ land_id: 1, global_sequence: -1 }, {background: true});
    console.log('Creating mines:land_id_block_timestamp index')
    const mines_land_id_block_timestamp_ind = await mines_collection.createIndex({ land_id: 1, block_timestamp: -1 }, {background: true});
    console.log('Creating mines:landowner index')
    const mines_landowner_ind = await mines_collection.createIndex({ landowner: 1, global_sequence: -1 }, {background: true});
    console.log('Creating mines:planet index')
    const mines_planet_ind = await mines_collection.createIndex({ planet: 1, global_sequence: -1 }, {background: true});
    console.log('Creating mines:block_num index')
    const mines_block_num_ind = await mines_collection.createIndex({ block_num: -1 }, {background: true});
    console.log('Creating mines:block_timestamp index')
    const mines_block_timestamp_ind = await mines_collection.createIndex({ block_timestamp: 1 }, {background: true});

    const nfts_collection = mongo.collection('nfts');
    console.log('Creating nfts:global_sequence index')
    const nfts_global_ind = await nfts_collection.createIndex({ global_sequence: 1 }, { unique: true, background: true });
    console.log('Creating nfts:block_timestamp_sequence index')
    const nfts_global_timestamp_ind = await nfts_collection.createIndex({ global_sequence: 1, block_timestamp: -1 }, { background: true });
    console.log('Creating nfts:miner index')
    const nfts_miner_ind = await nfts_collection.createIndex({ miner: 1 }, { background: true });
    console.log('Creating nfts:land_id index')
    const nfts_land_id_ind = await nfts_collection.createIndex({ land_id: 1 }, { background: true });
    console.log('Creating nfts:rarity index')
    const nfts_rarity_ind = await nfts_collection.createIndex({ 'template_data.rarity': 1 }, { background: true });

    const assets_collection = mongo.collection('assets');
    console.log('Creating assets:owner index')
    const assets_owner_ind = await assets_collection.createIndex({ owner: 1 }, { background: true })
    console.log('Creating assets:asset_id index')
    const assets_owner_ind = await assets_collection.createIndex({ asset_id: 1 }, { unique: true, background: true })

    const atomictransfers_collection = mongo.collection('atomictransfers');
    console.log('Creating atomictransfers:asset_ids index')
    const atomictransfers_asset_ids_ind = await atomictransfers_collection.createIndex({ asset_ids: 1 }, { background: true })

    process.exit(0);
})();
