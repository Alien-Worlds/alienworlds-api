/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ListNftsInput } from '../list-nfts.input';

const dto = {
  limit: 10,
  from: '2021-06-17T01:05:38.000Z',
  to: '2021-06-17T01:05:38.000Z',
  global_sequence_from: 1,
  global_sequence_to: 2,
  miner: 'fake_miner',
  land_id: 'fake_land_id',
  sort: 'asc',
  rarity: 'rare',
};

describe('ListNftsInput Unit tests', () => {
  it('"ListNftsInput.fromDto" should create controller input data based on user data', async () => {
    const input = ListNftsInput.fromDto(dto);
    expect(input).toEqual({
      limit: 10,
      from: '2021-06-17T01:05:38.000Z',
      to: '2021-06-17T01:05:38.000Z',
      globalSequenceFrom: 1,
      globalSequenceTo: 2,
      miner: 'fake_miner',
      landId: 'fake_land_id',
      sort: 'asc',
      rarity: 'rare',
    });
  });
});
