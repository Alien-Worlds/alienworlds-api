/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MongoSource } from '@core/storage/data-sources/mongo.source';
import { Db, Long } from 'mongodb';
import { AssetMongoSource } from '../asset.mongo.source';

const db = {
  databaseName: 'TestDB',
  collection: jest.fn(() => ({
    findOne: jest.fn(),
    updateOne: jest.fn(),
    insertOne: jest.fn(),
    insertMany: jest.fn(),
  })) as any,
};

const mongoSource = new MongoSource(db as Db);

describe('AssetMongoSource Unit tests', () => {
  it('Should call findOne and convert asset_id to Long', () => {
    const source = new AssetMongoSource(mongoSource);
    const findOneMock = jest.spyOn(source, 'findOne');
    source.findByAssetId(0n);
    expect(findOneMock).toBeCalledWith({
      asset_ids: Long.fromBigInt(0n),
    });
  });
});
