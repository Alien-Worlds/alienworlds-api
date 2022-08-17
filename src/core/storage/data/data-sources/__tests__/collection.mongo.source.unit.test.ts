/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import * as mongoDB from 'mongodb';
import { CollectionMongoSource } from '../collection.mongo.source';
import { MongoSource } from '../mongo.source';
import { DataSourceOperationError } from '@core/architecture/data/errors/data-source-operation.error';
import { DataSourceBulkWriteError } from '@core/architecture/data/errors/data-source-bulk-write.error';

jest.mock('mongodb');
let findMock;
let countMock;
let deleteOneMock;
let aggregateMock;
let findOneMock;
let updateOneMock;
let insertOneMock;
let insertManyMock;
let collectionSource: CollectionMongoSource<any>;
const db = {
  databaseName: 'TestDB',
  collection: jest.fn(() => ({
    find: jest.fn(() => findMock()),
    countDocuments: jest.fn(() => countMock()),
    aggregate: jest.fn(() => aggregateMock()),
    findOne: jest.fn(() => findOneMock()),
    updateOne: jest.fn(() => updateOneMock()),
    insertOne: jest.fn(() => insertOneMock()),
    insertMany: jest.fn(() => insertManyMock()),
    deleteOne: jest.fn(() => deleteOneMock()),
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
    findMock = null;
    countMock = null;
    aggregateMock = null;
    deleteOneMock = null;
    findOneMock = null;
    updateOneMock = null;
    insertOneMock = null;
    insertManyMock = null;
  });

  it('"remove" should return true when deletion was successful', async () => {
    const expectedResult = true;
    deleteOneMock = () => ({ deletedCount: 1 });
    const result = await collectionSource.remove({});

    expect(result).toEqual(expectedResult);
  });

  it('"remove" should return false when document was not found and removed', async () => {
    const expectedResult = false;
    deleteOneMock = () => ({ deletedCount: 0 });
    const result = await collectionSource.remove({});

    expect(result).toEqual(expectedResult);
  });

  it('"remove" should throw an error when fetching has failed', async () => {
    deleteOneMock = () => {
      throw new Error('deleteOne error');
    };
    try {
      await collectionSource.remove({});
    } catch (error) {
      expect(error).toBeInstanceOf(DataSourceOperationError);
    }
  });

  it('"find" should return DTOs', async () => {
    const expectedResult = [{ foo: 1 }, { foo: 2 }];
    findMock = () => ({
      sort: jest.fn(() => findMock()),
      limit: jest.fn(() => findMock()),
      skip: jest.fn(() => findMock()),
      toArray: () => expectedResult,
    });
    const result = await collectionSource.find(
      {},
      { sort: 1, skip: 1, limit: 2 }
    );

    expect(result).toEqual(expectedResult);
  });

  it('"find" should throw an error when fetching has failed', async () => {
    findMock = () => {
      throw new Error('find error');
    };
    try {
      await collectionSource.find({});
    } catch (error) {
      expect(error).toBeInstanceOf(DataSourceOperationError);
    }
  });

  it('"count" should return a number', async () => {
    const expectedResult = 1;
    countMock = () => expectedResult;
    const result = await collectionSource.count({});

    expect(result).toEqual(expectedResult);
  });

  it('"count" should throw an error when fetching has failed', async () => {
    countMock = () => {
      throw new Error('count error');
    };
    try {
      await collectionSource.count({});
    } catch (error) {
      expect(error).toBeInstanceOf(DataSourceOperationError);
    }
  });

  it('"aggregate" should return a list of dtos', async () => {
    const expectedResult = [{ foo: 1 }, { foo: 2 }];
    aggregateMock = () => ({
      toArray: () => expectedResult,
    });
    const result = await collectionSource.aggregate([]);

    expect(result).toEqual(expectedResult);
  });

  it('"aggregate" should throw an error when fetching has failed', async () => {
    aggregateMock = () => {
      throw new Error('aggregate error');
    };
    try {
      await collectionSource.aggregate([]);
    } catch (error) {
      expect(error).toBeInstanceOf(DataSourceOperationError);
    }
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
