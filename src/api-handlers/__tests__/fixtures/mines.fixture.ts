/* eslint-disable @typescript-eslint/no-explicit-any */
import { MineDocument } from '@common/mines/data/mines.dtos';
import { Mine } from '@common/mines/domain/entities/mine';
import {
  MineResult,
  MinesResponse,
  MinesSearchQuery,
  MinesRequestQueryOptions,
} from '../../mines';

export const sampleMineDocument: MineDocument = {
  _id: '62fd3a3bcc6d81005d135799',
  miner: 'fake.wam',
  params: {
    invalid: 0,
    error: '',
    delay: 560,
    difficulty: 0,
    ease: 69,
    luck: 6,
    commission: 95,
  },
  bounty: 837,
  land_id: '1099512958747',
  planet_name: 'neri.world',
  landowner: 'fakeowner.wam',
  bag_items: [1099575138963, 1099571561418, 1099572783734],
  offset: 125,
  block_num: 165058267,
  block_timestamp: '2022-02-04T14:34:53Z',
  global_sequence: 37593403954,
  tx_id: '92f0f074f841cafba129c28f65e551f022f7a2b5ba2fdc3463291fc7aee29ce1',
} as any;

export const sampleMine: Mine = {
  id: '62fd3a3bcc6d81005d135799',
  miner: 'fake.wam',
  invalid: 0,
  error: '',
  delay: 560,
  difficulty: 0,
  ease: 69,
  luck: 6,
  commission: 95,

  bounty: 837,
  landId: '1099512958747',
  planetName: 'neri.world',
  landowner: 'fakeowner.wam',
  bagItems: [1099575138963, 1099571561418, 1099572783734],
  offset: 125,
  blockNum: 165058267,
  blockTimestamp: '2022-02-04T14:34:53Z',
  globalSequence: 37593403954,
  txId: '92f0f074f841cafba129c28f65e551f022f7a2b5ba2fdc3463291fc7aee29ce1',
};

export const sampleMineResult: MineResult = {
  _id: '62fd3a3bcc6d81005d135799',
  miner: 'fake.wam',
  params: {
    invalid: 0,
    error: '',
    delay: 560,
    difficulty: 0,
    ease: 69,
    luck: 6,
    commission: 95,
  },
  bounty: 837,
  land_id: '1099512958747',
  planet_name: 'neri.world',
  landowner: 'fakeowner.wam',
  bag_items: [1099575138963, 1099571561418, 1099572783734],
  offset: 125,
  block_num: 165058267,
  block_timestamp: '2022-02-04T14:34:53Z',
  global_sequence: 37593403954,
  tx_id: '92f0f074f841cafba129c28f65e551f022f7a2b5ba2fdc3463291fc7aee29ce1',
};

export const sampleMinesResponse: MinesResponse = {
  results: [sampleMineResult],
  count: -1,
};

export const block_timestamp_from = '2022-01-20T19:29:41.294+00:00';
export const block_timestamp_to = '2022-03-21T19:29:41.000+00:00';
export const block_timestamp_fromTimestamp = 1642706981000;
export const block_timestamp_toTimestamp = 1647890981000;
export const global_sequence_from = 37593403953;
export const global_sequence_to = 37593403955;

export const noTxIdMinesRequestQueryOptions: MinesRequestQueryOptions = {
  miner: 'fake.wam',
  planet_name: 'neri.world',
  landowner: 'fakeowner.wam',
  land_id: '1099512958747',
  from: block_timestamp_from,
  to: block_timestamp_to,
  global_sequence_from,
  global_sequence_to,
};

export const noTxIdMinerSearchQuery: MinesSearchQuery = {
  miner: 'fake.wam',
  planet_name: 'neri.world',
  landowner: { $in: ['fakeowner.wam'] },
  land_id: { $in: ['1099512958747'] },
  block_timestamp: {
    $gte: new Date(block_timestamp_fromTimestamp),
    $lt: new Date(block_timestamp_toTimestamp),
  },
  global_sequence: { $gte: global_sequence_from, $lt: global_sequence_to },
};

export const onlyTxIdMinesRequestQueryOptions: MinesRequestQueryOptions = {
  tx_id: '92f0f074f841cafba129c28f65e551f022f7a2b5ba2fdc3463291fc7aee29ce1',
};

export const onlyTxIdMinerSearchQuery: MinesSearchQuery = {
  tx_id: '92f0f074f841cafba129c28f65e551f022f7a2b5ba2fdc3463291fc7aee29ce1',
};
