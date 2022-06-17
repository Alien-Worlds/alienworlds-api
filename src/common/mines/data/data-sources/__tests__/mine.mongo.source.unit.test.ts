/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { MongoSource } from '@core/storage/data-sources/mongo.source';
import { MineMongoSource } from '../mine.mongo.source';

jest.mock('@core/data/data-sources/mongo.source');

const mongoSourceMock = new MongoSource(null);
let minesSource: MineMongoSource;

describe('MineMongoSource Unit tests', () => {
  beforeEach(() => {
    minesSource = new MineMongoSource(mongoSourceMock);
  });

  it('"Token" should be set', () => {
    expect(MineMongoSource.Token).not.toBeNull();
  });

  it('Should return MineDocument object', async () => {
    const fakeDocument = { _id: 'fake.mine.document' };
    const findOneMock = jest
      .spyOn(
        //@ts-ignore
        minesSource.collection,
        'findOne'
      )
      .mockImplementation(() => fakeDocument);

    const result = await minesSource.findLastBlock();
    expect(result).toEqual(fakeDocument);

    findOneMock.mockReset();
  });
});
