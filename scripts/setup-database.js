/* eslint-disable @typescript-eslint/no-var-requires */
const commander = require('commander');
const { MongoClient } = require('mongodb');

const start = async options => {
  const { url, name } = options;
  console.log(`Connecting to database... ${url} ${name}`);

  const client = new MongoClient(url);
  const mongo = (await client.connect()).db(name);

  console.log('Connected!');

  const mines_collection = mongo.collection('mines');
  console.log('Creating mines:global_sequence index');
  await mines_collection.createIndex(
    { global_sequence: 1 },
    { unique: true, background: true }
  );
  console.log('Creating mines:miners index');
  await mines_collection.createIndex(
    { miner: 1, global_sequence: -1 },
    { background: true }
  );
  console.log('Creating mines:land_id index');
  await mines_collection.createIndex(
    { land_id: 1, global_sequence: -1 },
    { background: true }
  );
  console.log('Creating mines:land_id_block_timestamp index');
  await mines_collection.createIndex(
    { land_id: 1, block_timestamp: -1 },
    { background: true }
  );
  console.log('Creating mines:landowner index');
  await mines_collection.createIndex(
    { landowner: 1, global_sequence: -1 },
    { background: true }
  );
  console.log('Creating mines:landowner_block_timestamp index');
  await mines_collection.createIndex(
    { landowner: 1, block_timestamp: -1 },
    { background: true }
  );
  console.log('Creating mines:planet index');
  await mines_collection.createIndex(
    { planet: 1, global_sequence: -1 },
    { background: true }
  );
  console.log('Creating mines:block_num index');
  await mines_collection.createIndex({ block_num: -1 }, { background: true });
  console.log('Creating mines:block_timestamp index');
  await mines_collection.createIndex(
    { block_timestamp: 1 },
    { background: true }
  );
  console.log('Creating mines:tx_id index');
  await mines_collection.createIndex({ tx_id: 1 }, { background: true });

  const nfts_collection = mongo.collection('nfts');
  console.log('Creating nfts:global_sequence index');
  await nfts_collection.createIndex(
    { global_sequence: 1 },
    { unique: true, background: true }
  );
  console.log('Creating nfts:block_timestamp_sequence index');
  await nfts_collection.createIndex(
    { global_sequence: 1, block_timestamp: -1 },
    { background: true }
  );
  console.log('Creating nfts:miner index');
  await nfts_collection.createIndex({ miner: 1 }, { background: true });
  console.log('Creating nfts:land_id index');
  await nfts_collection.createIndex({ land_id: 1 }, { background: true });
  console.log('Creating nfts:rarity index');
  await nfts_collection.createIndex(
    { 'template_data.rarity': 1 },
    { background: true }
  );

  const assets_collection = mongo.collection('assets');
  console.log('Creating assets:owner index');
  await assets_collection.createIndex({ owner: 1 }, { background: true });
  console.log('Creating assets:asset_id index');
  await assets_collection.createIndex(
    { asset_id: 1 },
    { unique: true, background: true }
  );

  const atomictransfers_collection = mongo.collection('atomictransfers');
  console.log('Creating atomictransfers:asset_ids index');
  await atomictransfers_collection.createIndex(
    { asset_ids: 1 },
    { background: true }
  );

  process.exit(0);
};

commander
  .version('0.1', '-v, --version')
  .option('-u, --url <url>', 'Database url')
  .option('-n, --name <name>', 'Database name')
  .parse(process.argv);

start(commander.opts());
