/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { MineMongoSource } from '../mine.mongo.source';

const mongoSourceMock = {
  database: {
    collection: () => ({
      findOne: jest.fn(),
    }),
  },
};
let minesSource: MineMongoSource;

describe('MineMongoSource Unit tests', () => {
  beforeEach(() => {
    minesSource = new MineMongoSource(mongoSourceMock as any);
  });

  it('"Token" should be set', () => {
    expect(MineMongoSource.Token).not.toBeNull();
  });

  it('Should return MineDocument object', async () => {
    const fakeDocument = { _id: 'fake.mine.document' };
    const findOneMock = jest
      .spyOn((minesSource as any).collection, 'findOne')
      .mockImplementation(() => fakeDocument);

    const result = await minesSource.findLastBlock();
    expect(result).toEqual(fakeDocument);

    findOneMock.mockReset();
  });
});
