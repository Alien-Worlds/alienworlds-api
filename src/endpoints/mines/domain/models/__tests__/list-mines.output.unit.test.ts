/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Mine } from '@alien-worlds/alienworlds-api-common';
import { MongoDB, Result } from '@alien-worlds/api-core';
import { ListMinesOutput } from '../list-mines.output';

const mineDocument = {
  _id: new MongoDB.ObjectId('61dee6039181c700422ef773'),
  miner: 'fakeMiner',
  params: {
    invalid: 0,
    error: '',
    delay: 560,
    difficulty: 0,
    ease: 69,
    luck: 6,
    commission: 95,
  },
  bounty: 919,
  land_id: '1099512958747',
  planet_name: 'neri.world',
  landowner: 'fakeowner1.wam',
  bag_items: [
    MongoDB.Long.fromBigInt(1099561713548n),
    MongoDB.Long.fromBigInt(1099561713532n),
    MongoDB.Long.fromBigInt(1099561713528n),
  ],
  offset: 1817,
  block_num: MongoDB.Long.fromBigInt(161084966n),
  block_timestamp: new Date('2022-01-12T14:27:41.000Z'),

  global_sequence: MongoDB.Long.fromBigInt(34647697390n),
  tx_id: '3d6d93bb26201b42007aa165d1e92dad880367972c93ede6b6f8672d330f65a7',
};

describe('ListMinesOutput Unit tests', () => {
  it('"ListMinesOutput.create" should create output based on entities', async () => {
    const output = ListMinesOutput.create(
      Result.withContent([Mine.fromDocument(mineDocument)])
    );
    expect(output.toResponse()).toEqual({
      body: {
        results: [
          {
            _id: '61dee6039181c700422ef773',
            miner: 'fakeMiner',
            params: {
              invalid: 0,
              error: '',
              delay: 560,
              difficulty: 0,
              ease: 69,
              luck: 6,
              commission: 95,
            },
            bounty: 919,
            land_id: '1099512958747',
            planet_name: 'neri.world',
            landowner: 'fakeowner1.wam',
            bag_items: [
              Number(1099561713548n),
              Number(1099561713532n),
              Number(1099561713528n),
            ],
            offset: 1817,
            block_num: Number(161084966n),
            block_timestamp: new Date('2022-01-12T14:27:41.000Z'),
            global_sequence: Number(34647697390n),
            tx_id:
              '3d6d93bb26201b42007aa165d1e92dad880367972c93ede6b6f8672d330f65a7',
          },
        ],
        count: -1,
      },
      status: 200,
    });
  });

  it('"ListMinesOutput.createEmpty" should create empty output', async () => {
    const output = ListMinesOutput.createEmpty();
    expect(JSON.stringify(output.toResponse())).toEqual(
      JSON.stringify({
        status: 200,
        body: {
          results: [],
          count: -1,
        },
      })
    );
  });
});
