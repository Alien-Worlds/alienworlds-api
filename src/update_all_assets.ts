#!/usr/bin/env node

import { connectMongo } from './connections/mongo'
import {AssetAggregator} from "./include/assetaggregator";

(async () => {
    const config = require(`./config`);

    const mongo: any = await connectMongo(config.mongo);
    console.log('Connected to mongo')

    const asset_ids = await mongo.collection('assets_raw').distinct('asset_id');
    console.log(asset_ids)

    const aggregator = new AssetAggregator(config, mongo);
    for (let a = 0; a < asset_ids.length; a++){
        await aggregator.process(asset_ids[a].toString());
        console.log(`Processed ${asset_ids[a]}`);
    }

    process.exit(0);
})();
