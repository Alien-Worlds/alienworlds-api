/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MongoDB } from '@alien-worlds/api-core';
import { ListNftsInput } from '../list-nfts.input';
import { ListNftsQueryModel } from '../list-nfts.query-model';

const query = {
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
    const model = ListNftsQueryModel.create(
      ListNftsInput.fromRequest({ query } as any)
    );
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
    query.sort = 'desc';
    const model = ListNftsQueryModel.create(
      ListNftsInput.fromRequest({ query } as any)
    );
    expect(model.sort).toEqual(-1);

    query.sort = 'asc';
  });

  it('"toQueryParams" should create mongodb query parameters', async () => {
    const model = ListNftsQueryModel.create(
      ListNftsInput.fromRequest({ query } as any)
    );
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
    query.rarity = 'fake';
    const model = ListNftsQueryModel.create(
      ListNftsInput.fromRequest({ query } as any)
    );
    expect(() => model.toQueryParams()).toThrowError();

    query.rarity = 'Rare';
  });

  it('"toQueryParams" should handle global_sequence data based on input', async () => {
    query.global_sequence_from = null;
    query.global_sequence_to = null;
    let model = ListNftsQueryModel.create(
      ListNftsInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.global_sequence).toBeUndefined();

    query.global_sequence_from = 1;
    query.global_sequence_to = 10;
    model = ListNftsQueryModel.create(
      ListNftsInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.global_sequence).toEqual({
      $gte: MongoDB.Long.fromNumber(1),
      $lt: MongoDB.Long.fromNumber(10),
    });

    query.global_sequence_from = null;
    query.global_sequence_to = 10;
    model = ListNftsQueryModel.create(
      ListNftsInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.global_sequence).toEqual({
      $lt: MongoDB.Long.fromNumber(10),
    });

    query.global_sequence_from = 1;
    query.global_sequence_to = null;
    model = ListNftsQueryModel.create(
      ListNftsInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.global_sequence).toEqual({
      $gte: MongoDB.Long.fromNumber(1),
    });
  });

  it('"toQueryParams" should handle block_timestamp data based on input', async () => {
    query.to = null;
    query.from = null;
    let model = ListNftsQueryModel.create(
      ListNftsInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.block_timestamp).toBeUndefined();

    query.from = '2021-06-17T01:05:38.000Z';
    query.to = '2021-06-17T02:05:38.000Z';
    model = ListNftsQueryModel.create(
      ListNftsInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.block_timestamp).toEqual({
      $gte: new Date('2021-06-17T01:05:38.000Z'),
      $lt: new Date('2021-06-17T02:05:38.000Z'),
    });

    query.from = null;
    query.to = '2021-06-17T02:05:38.000Z';
    model = ListNftsQueryModel.create(
      ListNftsInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.block_timestamp).toEqual({
      $lt: new Date('2021-06-17T02:05:38.000Z'),
    });

    query.from = '2021-06-17T01:05:38.000Z';
    query.to = null;
    model = ListNftsQueryModel.create(
      ListNftsInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.block_timestamp).toEqual({
      $gte: new Date('2021-06-17T01:05:38.000Z'),
    });
  });
});
