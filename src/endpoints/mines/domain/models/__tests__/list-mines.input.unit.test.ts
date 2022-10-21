/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ListMinesInput } from '../list-mines.input';

const dto = {
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

describe('ListMinesInput Unit tests', () => {
  it('"ListMinesInput.fromRequest" should create controller input data based on user data', async () => {
    const input = ListMinesInput.fromRequest(dto);

    expect(input).toEqual({
      from: '2021-06-17T01:05:38.000Z',
      globalSequenceFrom: 1,
      globalSequenceTo: 10,
      landId: 'fake_land_id',
      landowner: 'fake_landowner',
      limit: 10,
      miner: 'fake_miner',
      planetName: 'fake_planet_name',
      sort: 'asc',
      to: '2021-06-17T02:05:38.000Z',
      txId: 'fake_transaction_id',
    });
  });
});
