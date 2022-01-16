const { Long } = require('mongodb');

export class AssetAggregator {
  config: any;
  mongo: any;

  constructor(config, mongo) {
    this.config = config;
    this.mongo = mongo;
  }

  async process(asset_id: string) {
    // console.log(`Recalc asset data ${asset_id}`)
    const query = { asset_id: Long.fromString(asset_id) };
    const asset_collection = this.mongo.collection('assets_raw');
    const asset = await asset_collection.findOne(query, {
      sort: { sequence: -1 },
    });
    // console.log(asset)

    if (asset.template_id > 0) {
      const collection_t = this.mongo.collection('templates');
      const query_t = { template_id: asset.template_id };
      const template = await collection_t.findOne(query_t, {
        sort: { sequence: -1 },
      });

      if (!template) {
        console.log(`Could not find template id ${asset.template_id}`);
        return;
      }

      asset.data = {
        ...asset.mutable_serialized_data,
        ...asset.immutable_serialized_data,
        ...template.immutable_serialized_data,
      };

      // find mint number
      // get the first sequence number for this
      const asset_first = await asset_collection.findOne(query, {
        sort: { sequence: 1 },
      });
      const ids = await asset_collection.distinct('asset_id', {
        template_id: template.template_id,
        sequence: { $lte: asset_first.sequence },
      });
      asset.mint_number = ids.length;
    } else {
      asset.data = {
        ...asset.mutable_serialized_data,
        ...asset.immutable_serialized_data,
      };
    }

    if (asset.data.name) {
      asset.name = asset.data.name;
    }

    delete asset._id;
    delete asset.ram_payer;
    delete asset.immutable_serialized_data;
    delete asset.mutable_serialized_data;
    delete asset.block_num;
    delete asset.data_hash;
    delete asset.block_timestamp;
    delete asset.sequence;

    try {
      asset.asset_id = Long.fromNumber(asset.asset_id);
      const processed_col = this.mongo.collection('assets');
      await processed_col.deleteOne({ asset_id: asset.asset_id });
      await processed_col.insertOne(asset);
    } catch (e) {
      // continue regardless of error
    }
  }
}
