// Fixed test data. Ids, dates and numbers are constant so responses are repeatable.
const { MongoClient, Long, ObjectId } = require('/var/www/api/node_modules/mongodb');

const oid = n => new ObjectId(n.toString(16).padStart(24, '0'));
const day = d => new Date(`2022-01-${String(d).padStart(2, '0')}T12:00:00.000Z`);

const assets = [
  ['1099511627776', 'miner1.wam', 'tool.worlds', 'Rare'],
  ['1099511627777', 'miner1.wam', 'tool.worlds', 'Common'],
  ['1099511627778', 'miner2.wam', 'land.worlds', 'Epic'],
].map(([id, owner, schema, rarity], i) => ({
  _id: oid(0x300 + i),
  asset_id: Long.fromString(id),
  owner,
  data: { schema_name: schema, immutable_serialized_data: { name: `Asset ${i}`, rarity } },
}));

// Each miner keeps the same bag on every mine. /mineluck takes the first of an
// $addToSet of bags, so differing bags would make `tools` arbitrary (an existing
// quirk of that route, not something this harness is testing).
const mines = [
  // miner, landowner, land_id, planet, luck, tools
  ['miner1.wam', 'owner1.wam', '1099511627780', 'eyeke.world', 1.5, ['1099511627776', '1099511627777']],
  ['miner1.wam', 'owner1.wam', '1099511627780', 'eyeke.world', 2.5, ['1099511627776', '1099511627777']],
  ['miner2.wam', 'owner2.wam', '1099511627781', 'kavian.world', 0.5, ['1099511627778']],
  ['miner2.wam', 'owner1.wam', '1099511627780', 'neri.world', 3, ['1099511627778']],
  ['miner3.wam', 'owner3.wam', '1099511627782', 'magor.world', 0, []],
  ['miner1.wam', 'owner2.wam', '1099511627781', 'kavian.world', 4, ['1099511627776', '1099511627777']],
].map(([miner, landowner, land_id, planet_name, luck, bag], i) => ({
  _id: oid(0x100 + i),
  global_sequence: 1000 + i,
  block_num: 5000 + i,
  block_timestamp: day(i + 1),
  tx_id: `tx${i}`.padEnd(64, '0'),
  miner,
  landowner,
  land_id,
  planet_name,
  params: { luck, land_id, miner },
  bag_items: bag.map(b => Long.fromString(b)),
}));

const nfts = [
  ['miner1.wam', '1099511627780', 1001, 'Rare'],
  ['miner1.wam', '1099511627780', 1002, 'Common'],
  ['miner2.wam', '1099511627781', 1001, 'Epic'],
  ['miner3.wam', '1099511627782', 1003, 'Legendary'],
].map(([miner, land_id, template_id, rarity], i) => ({
  _id: oid(0x200 + i),
  global_sequence: 2000 + i,
  block_num: 6000 + i,
  block_timestamp: day(i + 1),
  miner,
  land_id,
  template_id,
  rarity,
}));

module.exports = async function seed(url, dbName) {
  const client = await MongoClient.connect(url, { useUnifiedTopology: true });
  const db = client.db(dbName);
  await db.dropDatabase();
  await db.collection('assets').insertMany(assets);
  await db.collection('mines').insertMany(mines);
  await db.collection('nfts').insertMany(nfts);
  await client.close();
};
