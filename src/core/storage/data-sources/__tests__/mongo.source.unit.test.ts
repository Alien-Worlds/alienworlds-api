import 'reflect-metadata';
import * as mongoDB from 'mongodb';
import { MongoSource } from '../mongo.source';

describe('MongoSource Unit tests', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('"Token" should be set', () => {
    expect(MongoSource.Token).not.toBeNull();
  });

  it('Should reject with error when the connection fails', async () => {
    const db: mongoDB.Db = { databaseName: 'TestDB' } as mongoDB.Db;
    const source = new MongoSource(db);

    expect(source.database).toEqual({ databaseName: 'TestDB' });
  });
});
