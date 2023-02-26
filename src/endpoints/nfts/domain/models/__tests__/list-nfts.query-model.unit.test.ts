/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MongoDB } from '@alien-worlds/api-core';
import { ListNftsInput } from '../list-nfts.input';
import { ListNftsQueryModel } from '../list-nfts.query-model';

const dto = {
  limit: 10,
  from: '2021-06-17T01:05:38.000Z',
  to: '2021-06-17T01:05:38.000Z',
  global_sequence_from: 1,
  global_sequence_to: 2,
  miner: 'fake_miner',
  land_id: 'fake_land_id',
  sort: 'asc',
  rarity: 'Rare',
};

describe('ListNftsQueryModel Unit tests', () => {
  it('"ListNftsQueryModel.create" should create query model', async () => {
    const model = ListNftsQueryModel.create(ListNftsInput.fromDto(dto));
    expect(model).toEqual({
      from: '2021-06-17T01:05:38.000Z',
      globalSequenceFrom: 1,
      globalSequenceTo: 2,
      landId: 'fake_land_id',
      limit: 10,
      miner: 'fake_miner',
      rarity: 'Rare',
      sort: 1,
      to: '2021-06-17T01:05:38.000Z',
    });
  });

  it('"ListNftsQueryModel.create" should create query model with proper sorting value', async () => {
    dto.sort = 'desc';
    const model = ListNftsQueryModel.create(ListNftsInput.fromDto(dto));
    expect(model.sort).toEqual(-1);

    dto.sort = 'asc';
  });

  it('"toQueryParams" should create mongodb query parameters', async () => {
    const model = ListNftsQueryModel.create(ListNftsInput.fromDto(dto));
    expect(model.toQueryParams()).toEqual({
      filter: {
        block_timestamp: {
          $gte: new Date('2021-06-17T01:05:38.000Z'),
          $lt: new Date('2021-06-17T01:05:38.000Z'),
        },
        global_sequence: {
          $gte: MongoDB.Long.fromNumber(1),
          $lt: MongoDB.Long.fromNumber(2),
        },
        land_id: {
          $in: ['fake_land_id'],
        },
        miner: 'fake_miner',
        'template_data.rarity': 'Rare',
      },
      options: {
        limit: 10,
        sort: {
          global_sequence: 1,
        },
      },
    });
  });

  it('"toQueryParams" should throw error when rarity is not valid', async () => {
    dto.rarity = 'fake';
    const model = ListNftsQueryModel.create(ListNftsInput.fromDto(dto));
    expect(() => model.toQueryParams()).toThrowError();

    dto.rarity = 'Rare';
  });

  it('"toQueryParams" should handle global_sequence data based on input', async () => {
    dto.global_sequence_from = null;
    dto.global_sequence_to = null;
    let model = ListNftsQueryModel.create(ListNftsInput.fromDto(dto));

    expect(model.toQueryParams().filter.global_sequence).toBeUndefined();

    dto.global_sequence_from = 1;
    dto.global_sequence_to = 10;
    model = ListNftsQueryModel.create(ListNftsInput.fromDto(dto));

    expect(model.toQueryParams().filter.global_sequence).toEqual({
      $gte: MongoDB.Long.fromNumber(1),
      $lt: MongoDB.Long.fromNumber(10),
    });

    dto.global_sequence_from = null;
    dto.global_sequence_to = 10;
    model = ListNftsQueryModel.create(ListNftsInput.fromDto(dto));

    expect(model.toQueryParams().filter.global_sequence).toEqual({
      $lt: MongoDB.Long.fromNumber(10),
    });

    dto.global_sequence_from = 1;
    dto.global_sequence_to = null;
    model = ListNftsQueryModel.create(ListNftsInput.fromDto(dto));

    expect(model.toQueryParams().filter.global_sequence).toEqual({
      $gte: MongoDB.Long.fromNumber(1),
    });
  });

  it('"toQueryParams" should handle block_timestamp data based on input', async () => {
    dto.to = null;
    dto.from = null;
    let model = ListNftsQueryModel.create(ListNftsInput.fromDto(dto));

    expect(model.toQueryParams().filter.block_timestamp).toBeUndefined();

    dto.from = '2021-06-17T01:05:38.000Z';
    dto.to = '2021-06-17T02:05:38.000Z';
    model = ListNftsQueryModel.create(ListNftsInput.fromDto(dto));

    expect(model.toQueryParams().filter.block_timestamp).toEqual({
      $gte: new Date('2021-06-17T01:05:38.000Z'),
      $lt: new Date('2021-06-17T02:05:38.000Z'),
    });

    dto.from = null;
    dto.to = '2021-06-17T02:05:38.000Z';
    model = ListNftsQueryModel.create(ListNftsInput.fromDto(dto));

    expect(model.toQueryParams().filter.block_timestamp).toEqual({
      $lt: new Date('2021-06-17T02:05:38.000Z'),
    });

    dto.from = '2021-06-17T01:05:38.000Z';
    dto.to = null;
    model = ListNftsQueryModel.create(ListNftsInput.fromDto(dto));

    expect(model.toQueryParams().filter.block_timestamp).toEqual({
      $gte: new Date('2021-06-17T01:05:38.000Z'),
    });
  });
});
