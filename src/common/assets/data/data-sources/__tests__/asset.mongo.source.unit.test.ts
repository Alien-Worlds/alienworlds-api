/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MongoSource } from '@core/storage/data/data-sources/mongo.source';
import { Db, Long } from 'mongodb';
import { AssetMongoSource } from '../asset.mongo.source';

let findMock;

const db = {
  databaseName: 'TestDB',
  collection: jest.fn(() => ({
    findOne: jest.fn(),
    find: jest.fn(() => findMock()),
    updateOne: jest.fn(),
    insertOne: jest.fn(),
    insertMany: jest.fn(),
  })) as any,
};

const mongoSource = new MongoSource(db as Db);

describe('AssetMongoSource Unit tests', () => {
  it('"findByAssetId" should call findOne and convert asset_id to Long', () => {
    const source = new AssetMongoSource(mongoSource);
    const findOneMock = jest.spyOn(source, 'findOne');
    source.findByAssetId(0n);
    expect(findOneMock).toBeCalledWith({
      asset_id: Long.fromBigInt(0n),
    });
  });

  it('"findManyByAssetIds" should call find and convert asset_id to Long', () => {
    const expectedResult = [];
    findMock = () => ({
      sort: jest.fn(() => findMock()),
      limit: jest.fn(() => findMock()),
      skip: jest.fn(() => findMock()),
      toArray: () => expectedResult,
    });
    const assetIds = [0n];
    const source = new AssetMongoSource(mongoSource);
    const sourceFindMock = jest.spyOn(source, 'find');
    source.findManyByAssetIds(assetIds);
    expect(sourceFindMock).toBeCalledWith({
      asset_id: { $in: assetIds.map(id => Long.fromBigInt(id)) },
    });
  });
});
