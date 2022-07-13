/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DataSourceOperationError } from '@core/architecture/data/errors/data-source-operation.error';
import { NftMongoSource } from '../nft.mongo.source';

const blockTimestamp = new Date(1645815926208);
const nftParamsDto = {
  invalid: 0,
  error: 'error',
  delay: 0,
  difficulty: 1,
  ease: 1,
  luck: 1,
  commission: 1,
};
const nftTemplateDto = {
  cardid: 1,
  name: 'foo.nft',
  img: 'none',
  backimg: 'back-none',
  rarity: 'rare',
  shine: 'Stone',
  description: 'foo bar baz',
  attack: 100,
  defense: 200,
  class: 'some',
  movecost: 2,
  race: 'some',
  type: 'Manipulator',
  element: 'some',
  delay: 75,
  difficulty: 1,
  ease: 10,
  luck: 5,
};
const nftDto = {
  miner: 'fake.foo',
  land_id: 'fake.land',
  params: nftParamsDto,
  rand1: 1,
  rand2: 2,
  rand3: 3,
  template_id: 11,
  block_num: 0n,
  block_timestamp: blockTimestamp,
  global_sequence: 0n,
  template_data: nftTemplateDto,
};

const fakeId = 'fake.id';
let insertOne = () => ({ insertedId: fakeId });
const mongoSource = {
  database: {
    collection: () => ({
      insertOne,
    }),
  },
};

describe('NftMongoSource Unit tests', () => {
  it('Should add new document and return id', async () => {
    const nftSource = new NftMongoSource(mongoSource as any);
    const id = await nftSource.insertOne({});
    expect(id).toEqual(fakeId);
  });

  it('Should add entity to the reposiotry and return it with assigned id', async () => {
    try {
      insertOne = () => {
        throw new Error('some error');
      };
      const nftSource = new NftMongoSource(mongoSource as any);
      const id = await nftSource.insertOne({});
    } catch (error) {
      expect(error).toBeInstanceOf(DataSourceOperationError);
    }
  });
});
