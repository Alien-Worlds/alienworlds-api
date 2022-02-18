import {
  Asset,
  AssetDocument,
  AssetResponse,
  AssetResult,
  Long,
} from '../../asset';

export const long_0: Long = {
  _bsontype: 'Long',
  high_: 0,
  low_: 0,
};
export const long_1099535583633: Long = {
  _bsontype: 'Long',
  high_: 256,
  low_: 23955857,
};
export const long_1099624236152: Long = {
  _bsontype: 'Long',
  high_: 256,
  low_: 112608376,
};

export const sampleAsset: Asset = {
  id: '61f7f245a92817601180e8eb',
  assetId: '123456',
  collectionName: 'alien.worlds',
  schemaName: 'tools.worlds',
  templateId: '123456',
  owner: 'fakeowner0',
  cardId: 1,
  name: 'Standard Shovel',
  img: 'QmYm1FG7LxhF3mFUaVmVEVqRztEmByVbHwL6ZWXwVY2dvb',
  backImg: 'QmaUNXHeeFvMGD4vPCC3vpGTr77tJvBHjh1ndUm4J7o4tP',
  rarity: 'Abundant',
  shine: 'Stone',
  type: 'Extractor',
  delay: 80,
  difficulty: 0,
  ease: 0,
  luck: 10,
};

export const sampleAssetResult: AssetResult = {
  asset_id: '123456',
  collection_name: 'alien.worlds',
  schema_name: 'tools.worlds',
  template_id: '123456',
  owner: 'fakeowner0',
  data: {
    cardid: 1,
    name: 'Standard Shovel',
    img: 'QmYm1FG7LxhF3mFUaVmVEVqRztEmByVbHwL6ZWXwVY2dvb',
    backimg: 'QmaUNXHeeFvMGD4vPCC3vpGTr77tJvBHjh1ndUm4J7o4tP',
    rarity: 'Abundant',
    shine: 'Stone',
    type: 'Extractor',
    delay: 80,
    difficulty: 0,
    ease: 0,
    luck: 10,
  },
};

export const sampleAssetDocument: AssetDocument = {
  _id: '61f7f245a92817601180e8eb',
  asset_id: '123456',
  owner: 'fakeowner0',
  data: {
    collection_name: 'alien.worlds',
    schema_name: 'tools.worlds',
    template_id: '123456',
    immutable_serialized_data: {
      cardid: 1,
      name: 'Standard Shovel',
      img: 'QmYm1FG7LxhF3mFUaVmVEVqRztEmByVbHwL6ZWXwVY2dvb',
      backimg: 'QmaUNXHeeFvMGD4vPCC3vpGTr77tJvBHjh1ndUm4J7o4tP',
      rarity: 'Abundant',
      shine: 'Stone',
      type: 'Extractor',
      delay: 80,
      difficulty: 0,
      ease: 0,
      luck: 10,
    },
  },
};

export const standardShovelAssetDocument: AssetDocument = {
  _id: '61f7f24ba92817601180e928',
  asset_id: '123456',
  owner: 'fakeowner0',
  data: {
    collection_name: 'alien.worlds',
    schema_name: 'standard.tools.worlds',
    template_id: '123456',
    immutable_serialized_data: {
      cardid: 1,
      name: 'Standard Shovel',
      img: 'QmYm1FG7LxhF3mFUaVmVEVqRztEmByVbHwL6ZWXwVY2dvb',
      backimg: 'QmaUNXHeeFvMGD4vPCC3vpGTr77tJvBHjh1ndUm4J7o4tP',
      rarity: 'Abundant',
      shine: 'Stone',
      type: 'Extractor',
      delay: 80,
      difficulty: 0,
      ease: 0,
      luck: 10,
    },
  },
};

export const standardShovelAsset: Asset = {
  id: '61f7f24ba92817601180e928',
  assetId: '123456',
  collectionName: 'alien.worlds',
  schemaName: 'standard.tools.worlds',
  templateId: '123456',
  owner: 'fakeowner0',
  cardId: 1,
  name: 'Standard Shovel',
  img: 'QmYm1FG7LxhF3mFUaVmVEVqRztEmByVbHwL6ZWXwVY2dvb',
  backImg: 'QmaUNXHeeFvMGD4vPCC3vpGTr77tJvBHjh1ndUm4J7o4tP',
  rarity: 'Abundant',
  shine: 'Stone',
  type: 'Extractor',
  delay: 80,
  difficulty: 0,
  ease: 0,
  luck: 10,
};

export const standardShovelAssetResult: AssetResult = {
  asset_id: '123456',
  collection_name: 'alien.worlds',
  schema_name: 'standard.tools.worlds',
  template_id: '123456',
  owner: 'fakeowner0',
  data: {
    cardid: 1,
    name: 'Standard Shovel',
    img: 'QmYm1FG7LxhF3mFUaVmVEVqRztEmByVbHwL6ZWXwVY2dvb',
    backimg: 'QmaUNXHeeFvMGD4vPCC3vpGTr77tJvBHjh1ndUm4J7o4tP',
    rarity: 'Abundant',
    shine: 'Stone',
    type: 'Extractor',
    delay: 80,
    difficulty: 0,
    ease: 0,
    luck: 10,
  },
};

export const sampleAssetResponse: AssetResponse = {
  results: [sampleAssetResult],
};

export const emptyAssetResponse: AssetResponse = {
  results: [],
};
