/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { MongoSource } from '@core/data/data-sources/mongo.source';
import { Container } from 'inversify';
import { MinesMongoSource } from '../mines.mongo.source';

jest.mock('@core/data/data-sources/mongo.source');

const mongoSourceMock = new MongoSource(null);

let container: Container;
let minesSource: MinesMongoSource;

describe('MinesMongoSource Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<MongoSource>(MongoSource.Token)
      .toConstantValue(mongoSourceMock);
    container
      .bind<MinesMongoSource>(MinesMongoSource.Token)
      .to(MinesMongoSource);
  });

  beforeEach(() => {
    minesSource = container.get<MinesMongoSource>(MinesMongoSource.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(MinesMongoSource.Token).not.toBeNull();
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
