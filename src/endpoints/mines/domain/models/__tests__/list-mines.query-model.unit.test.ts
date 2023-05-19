/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MongoDB } from '@alien-worlds/api-core';
import { ListMinesInput } from '../list-mines.input';
import { ListMinesQueryModel } from '../list-mines.query-model';

const query = {
  limit: 10,
  from: '2021-06-17T01:05:38.000Z',
  to: '2021-06-17T02:05:38.000Z',
  global_sequence_from: 1,
  global_sequence_to: 10,
  miner: 'fake_miner',
  landowner: 'fake_landowner',
  land_id: 'fake_land_id',
  planet_name: 'fake_planet_name',
  tx_id: 'fake_transaction_id',
  sort: 'asc',
};

describe('ListMinesQueryModel Unit tests', () => {
  it('"ListMinesQueryModel.toQueryParams" should create mongodb query model', async () => {
    const model = ListMinesQueryModel.create(
      ListMinesInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams()).toEqual({
      filter: {
        block_timestamp: {
          $gte: new Date('2021-06-17T01:05:38.000Z'),
          $lt: new Date('2021-06-17T02:05:38.000Z'),
        },
        global_sequence: {
          $gte: MongoDB.Long.fromNumber(1),
          $lt: MongoDB.Long.fromNumber(10),
        },
        land_id: {
          $in: ['fake_land_id'],
        },
        landowner: {
          $in: ['fake_landowner'],
        },
        miner: 'fake_miner',
        planet_name: 'fake_planet_name',
        tx_id: 'fake_transaction_id',
      },
      options: {
        limit: 10,
        sort: {
          global_sequence: 1,
        },
      },
    });
  });

  it('"ListMinesQueryModel.toQueryParams" should handle global_sequence data based on input', async () => {
    query.global_sequence_from = null;
    query.global_sequence_to = null;
    let model = ListMinesQueryModel.create(
      ListMinesInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.global_sequence).toBeUndefined();

    query.global_sequence_from = 1;
    query.global_sequence_to = 10;
    model = ListMinesQueryModel.create(
      ListMinesInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.global_sequence).toEqual({
      $gte: MongoDB.Long.fromNumber(1),
      $lt: MongoDB.Long.fromNumber(10),
    });

    query.global_sequence_from = null;
    query.global_sequence_to = 10;
    model = ListMinesQueryModel.create(
      ListMinesInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.global_sequence).toEqual({
      $lt: MongoDB.Long.fromNumber(10),
    });

    query.global_sequence_from = 1;
    query.global_sequence_to = null;
    model = ListMinesQueryModel.create(
      ListMinesInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.global_sequence).toEqual({
      $gte: MongoDB.Long.fromNumber(1),
    });
  });

  it('"ListMinesQueryModel.toQueryParams" should handle block_timestamp data based on input', async () => {
    query.to = null;
    query.from = null;
    let model = ListMinesQueryModel.create(
      ListMinesInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.block_timestamp).toBeUndefined();

    query.from = '2021-06-17T01:05:38.000Z';
    query.to = '2021-06-17T02:05:38.000Z';
    model = ListMinesQueryModel.create(
      ListMinesInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.block_timestamp).toEqual({
      $gte: new Date('2021-06-17T01:05:38.000Z'),
      $lt: new Date('2021-06-17T02:05:38.000Z'),
    });

    query.from = null;
    query.to = '2021-06-17T02:05:38.000Z';
    model = ListMinesQueryModel.create(
      ListMinesInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.block_timestamp).toEqual({
      $lt: new Date('2021-06-17T02:05:38.000Z'),
    });

    query.from = '2021-06-17T01:05:38.000Z';
    query.to = null;
    model = ListMinesQueryModel.create(
      ListMinesInput.fromRequest({ query } as any)
    );

    expect(model.toQueryParams().filter.block_timestamp).toEqual({
      $gte: new Date('2021-06-17T01:05:38.000Z'),
    });
  });
});
