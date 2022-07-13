/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import * as mongoDB from 'mongodb';
import { CollectionMongoSource } from '../collection.mongo.source';
import { MongoSource } from '../mongo.source';
import { DataSourceOperationError } from '@core/architecture/data/errors/data-source-operation.error';
import { DataSourceBulkWriteError } from '@core/architecture/data/errors/data-source-bulk-write.error';

jest.mock('mongodb');
let findOneMock;
let updateOneMock;
let insertOneMock;
let insertManyMock;
let collectionSource: CollectionMongoSource<any>;
const db = {
  databaseName: 'TestDB',
  collection: jest.fn(() => ({
    findOne: jest.fn(() => findOneMock()),
    updateOne: jest.fn(() => updateOneMock()),
    insertOne: jest.fn(() => insertOneMock()),
    insertMany: jest.fn(() => insertManyMock()),
  })) as any,
};

const mongoSource = new MongoSource(db as mongoDB.Db);

describe('CollectionMongoSource Unit tests', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    collectionSource = new CollectionMongoSource<any>(mongoSource, 'test');
  });

  afterEach(() => {
    findOneMock = null;
    updateOneMock = null;
    insertOneMock = null;
    insertManyMock = null;
  });

  it('"findOne" should return DTO', async () => {
    const expectedResult = { foo: 1 };
    findOneMock = () => expectedResult;
    const result = await collectionSource.findOne({});

    expect(result).toEqual(expectedResult);
  });

  it('"findOne" should throw an error when fetching has failed', async () => {
    findOneMock = () => {
      throw new Error('findOne error');
    };
    try {
      await collectionSource.findOne({});
    } catch (error) {
      expect(error).toBeInstanceOf(DataSourceOperationError);
    }
  });

  it('"update" should call mongoDB updateOne and return DTO', async () => {
    const dto = { foo: 1 };
    updateOneMock = () => dto;
    const result = await collectionSource.update(dto);

    expect(result).toEqual(dto);
  });

  it('"update" should throw an error when operation has failed', async () => {
    updateOneMock = () => {
      throw new Error('update error');
    };
    try {
      await collectionSource.update({});
    } catch (error) {
      expect(error).toBeInstanceOf(DataSourceOperationError);
    }
  });

  it('"insert" should call mongoDB insertOne and return the string ID of the inserted document', async () => {
    const dto = { foo: 1 };
    insertOneMock = () => ({ insertedId: 'foo' });
    const result = await collectionSource.insert(dto);

    expect(result).toEqual('foo');
  });

  it('"insert" should throw an error when operation has failed', async () => {
    insertOneMock = () => {
      throw new Error('insert error');
    };
    try {
      await collectionSource.insert({});
    } catch (error) {
      expect(error).toBeInstanceOf(DataSourceOperationError);
    }
  });

  it('"insertMany" should call mongoDB insertManyOne and return the string ID of the inserted document', async () => {
    const dto = { foo: 1 };
    insertManyMock = () => ({ insertedIds: ['foo'] });
    const result = await collectionSource.insertMany([dto]);

    expect(result).toEqual(['foo']);
  });

  it('"insertMany" should throw an error when operation has failed', async () => {
    insertManyMock = () => {
      throw new Error('insertMany error');
    };
    try {
      await collectionSource.insertMany([{}]);
    } catch (error) {
      expect(error).toBeInstanceOf(DataSourceBulkWriteError);
    }
  });
});
