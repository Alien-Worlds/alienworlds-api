#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectMongo } from './connections/mongo';
import { AssetAggregator } from './include/assetaggregator';
import config from './config';

(async () => {
  const mongo: any = await connectMongo(config.mongo);
  console.log('Connected to mongo');

  // const asset_ids = await mongo.collection('assets_raw').distinct('asset_id');
  const asset_ids = await mongo
    .collection('assets_raw')
    .aggregate([{ $group: { _id: '$asset_id' } }]);

  const aggregator = new AssetAggregator(config, mongo);
  while (await asset_ids.hasNext()) {
    const a = await asset_ids.next();
    const asset_id = a._id;
    await aggregator.process(asset_id.toString());
    console.log(`Processed ${asset_id}`);
  }

  process.exit(0);
})();
