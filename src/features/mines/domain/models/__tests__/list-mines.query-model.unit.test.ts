/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Long } from 'mongodb';
import { ListMinesInput } from '../list-mines.input';
import { ListMinesQueryModel } from '../list-mines.query-model';

const requestData = {
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
      ListMinesInput.fromRequest(requestData)
    );

    expect(model.toQueryParams()).toEqual({
      filter: {
        block_timestamp: {
          $gte: new Date('2021-06-17T01:05:38.000Z'),
          $lt: new Date('2021-06-17T02:05:38.000Z'),
        },
        global_sequence: {
          $gte: Long.fromNumber(1),
          $lt: Long.fromNumber(10),
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
    requestData.global_sequence_from = null;
    requestData.global_sequence_to = null;
    let model = ListMinesQueryModel.create(
      ListMinesInput.fromRequest(requestData)
    );

    expect(model.toQueryParams().filter.global_sequence).toBeUndefined();

    requestData.global_sequence_from = 1;
    requestData.global_sequence_to = 10;
    model = ListMinesQueryModel.create(ListMinesInput.fromRequest(requestData));

    expect(model.toQueryParams().filter.global_sequence).toEqual({
      $gte: Long.fromNumber(1),
      $lt: Long.fromNumber(10),
    });

    requestData.global_sequence_from = null;
    requestData.global_sequence_to = 10;
    model = ListMinesQueryModel.create(ListMinesInput.fromRequest(requestData));

    expect(model.toQueryParams().filter.global_sequence).toEqual({
      $lt: Long.fromNumber(10),
    });

    requestData.global_sequence_from = 1;
    requestData.global_sequence_to = null;
    model = ListMinesQueryModel.create(ListMinesInput.fromRequest(requestData));

    expect(model.toQueryParams().filter.global_sequence).toEqual({
      $gte: Long.fromNumber(1),
    });
  });

  it('"ListMinesQueryModel.toQueryParams" should handle block_timestamp data based on input', async () => {
    requestData.to = null;
    requestData.from = null;
    let model = ListMinesQueryModel.create(
      ListMinesInput.fromRequest(requestData)
    );

    expect(model.toQueryParams().filter.block_timestamp).toBeUndefined();

    requestData.from = '2021-06-17T01:05:38.000Z';
    requestData.to = '2021-06-17T02:05:38.000Z';
    model = ListMinesQueryModel.create(ListMinesInput.fromRequest(requestData));

    expect(model.toQueryParams().filter.block_timestamp).toEqual({
      $gte: new Date('2021-06-17T01:05:38.000Z'),
      $lt: new Date('2021-06-17T02:05:38.000Z'),
    });

    requestData.from = null;
    requestData.to = '2021-06-17T02:05:38.000Z';
    model = ListMinesQueryModel.create(ListMinesInput.fromRequest(requestData));

    expect(model.toQueryParams().filter.block_timestamp).toEqual({
      $lt: new Date('2021-06-17T02:05:38.000Z'),
    });

    requestData.from = '2021-06-17T01:05:38.000Z';
    requestData.to = null;
    model = ListMinesQueryModel.create(ListMinesInput.fromRequest(requestData));

    expect(model.toQueryParams().filter.block_timestamp).toEqual({
      $gte: new Date('2021-06-17T01:05:38.000Z'),
    });
  });
});
