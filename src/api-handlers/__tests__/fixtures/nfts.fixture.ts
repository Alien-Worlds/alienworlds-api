import {
  NFT,
  NFTDocument,
  NFTResult,
  NFTSearchQuery,
  NFTsRequestQueryOptions,
  NFTsResponse,
} from '../../nfts';

export const sampleNFTDocument: NFTDocument = {
  _id: '61eee6039181c700422ef773',
  miner: 'fakeminer1.wam',
  land_id: '1099512961112',
  params: {
    invalid: 0,
    error: '',
    delay: 540,
    difficulty: 3,
    ease: 150,
    luck: 25,
    commission: 0,
  },
  rand1: 1.1764705882352942,
  rand2: 1.9058518348973832,
  rand3: 10.349019607843136,
  template_id: 19558,
  block_num: 124900087,
  block_timestamp: { date: '2022-02-17T01:05:38.000Z' },
  global_sequence: 8775201844,
  template_data: {
    cardid: 7,
    name: 'Standard Capacitor',
    img: 'QmaFe19mBfZWn2tvEN7Ea8xjdirnQQRisUGGBzBPb',
    backimg: 'QmaUNXHee4vPCC3vpGTr77tJvBHjh1ndUm4J7o4tP',
    rarity: 'Abundant',
    shine: 'Stone',
    type: 'Manipulator',
    delay: 75,
    difficulty: 1,
    ease: 10,
    luck: 5,
    movecost: 20,
  },
};

export const sampleNFT: NFT = {
  id: '61eee6039181c700422ef773',
  miner: 'fakeminer1.wam',
  landId: '1099512961112',
  params: {
    invalid: 0,
    error: '',
    delay: 540,
    difficulty: 3,
    ease: 150,
    luck: 25,
    commission: 0,
  },
  rand1: 1.1764705882352942,
  rand2: 1.9058518348973832,
  rand3: 10.349019607843136,
  templateId: 19558,
  blockNumber: 124900087,
  blockTimestamp: '2022-02-17T01:05:38.000Z',
  globalSequence: 8775201844,
  templateData: {
    cardId: 7,
    name: 'Standard Capacitor',
    img: 'QmaFe19mBfZWn2tvEN7Ea8xjdirnQQRisUGGBzBPb',
    backImg: 'QmaUNXHee4vPCC3vpGTr77tJvBHjh1ndUm4J7o4tP',
    rarity: 'Abundant',
    shine: 'Stone',
    type: 'Manipulator',
    delay: 75,
    difficulty: 1,
    ease: 10,
    luck: 5,
    moveCost: 20,
  },
};

export const sampleNFTResult: NFTResult = {
  _id: '61eee6039181c700422ef773',
  miner: 'fakeminer1.wam',
  land_id: '1099512961112',
  params: {
    invalid: 0,
    error: '',
    delay: 540,
    difficulty: 3,
    ease: 150,
    luck: 25,
    commission: 0,
  },
  rand1: 1.1764705882352942,
  rand2: 1.9058518348973832,
  rand3: 10.349019607843136,
  template_id: 19558,
  block_num: 124900087,
  block_timestamp: '2022-02-17T01:05:38.000Z',
  global_sequence: 8775201844,
  template_data: {
    cardid: 7,
    name: 'Standard Capacitor',
    img: 'QmaFe19mBfZWn2tvEN7Ea8xjdirnQQRisUGGBzBPb',
    backimg: 'QmaUNXHee4vPCC3vpGTr77tJvBHjh1ndUm4J7o4tP',
    rarity: 'Abundant',
    shine: 'Stone',
    type: 'Manipulator',
    delay: 75,
    difficulty: 1,
    ease: 10,
    luck: 5,
    movecost: 20,
  },
};

export const sampleNFTsResponse: NFTsResponse = {
  results: [sampleNFTResult],
  count: 1000,
};

export const block_timestamp_from = '2022-01-20T19:29:41.000+00:00';
export const block_timestamp_to = '2022-03-21T19:29:41.000+00:00';
export const block_timestamp_fromTimestamp = 1642706981000;
export const block_timestamp_toTimestamp = 1647890981000;
export const global_sequence_from = 37593403953;
export const global_sequence_to = 37593403955;

export const nftsRequestQueryOptions: NFTsRequestQueryOptions = {
  miner: 'fakeminer1.wam',
  land_id: '1099512961112',
  rarity: 'Abundant',
  from: block_timestamp_from,
  to: block_timestamp_to,
  global_sequence_from,
  global_sequence_to,
};

export const nftsSearchQuery: NFTSearchQuery = {
  miner: 'fakeminer1.wam',
  'template_data.rarity': 'Abundant',
  land_id: { $in: ['1099512961112'] },
  block_timestamp: {
    $gte: new Date(block_timestamp_fromTimestamp),
    $lt: new Date(block_timestamp_toTimestamp),
  },
  global_sequence: { $gte: global_sequence_from, $lt: global_sequence_to },
};

export const wrongRarityNftsRequestQueryOptions: NFTsRequestQueryOptions = {
  ...nftsRequestQueryOptions,
  rarity: 'Fake',
};

export const noFromTimestampsNftsRequestQueryOptions: NFTsRequestQueryOptions =
  {
    miner: 'fakeminer1.wam',
    land_id: '1099512961112',
    rarity: 'Abundant',
    to: block_timestamp_to,
    global_sequence_to,
  };

export const noFromTimestampsNftsSearchQuery: NFTSearchQuery = {
  miner: 'fakeminer1.wam',
  'template_data.rarity': 'Abundant',
  land_id: { $in: ['1099512961112'] },
  block_timestamp: {
    $lt: new Date(block_timestamp_toTimestamp),
  },
  global_sequence: { $lt: global_sequence_to },
};
