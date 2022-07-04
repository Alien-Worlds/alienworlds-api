/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BlockRangeScan } from '@common/block-range-scan/domain/entities/block-range-scan';
import { NoBlockRangeFoundError } from '@common/block-range-scan/domain/errors/no-block-range.found.error';
import { config } from '@config';
import { Failure } from '@core/architecture/domain/failure';
import { MongoSource } from '@core/storage/data-sources/mongo.source';
import { BlockRangeScanRepositoryImpl } from '../block-range-scan.repository-impl';
import { BlockRangeScanMongoSource } from '../data-sources/block-range-scan.mongo.source';

const db = {
  databaseName: 'TestDB',
  collection: jest.fn(() => ({
    find: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    insertOne: jest.fn(),
    insertMany: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
    findOneAndUpdate: jest.fn(),
  })) as any,
};

const dto = {
  _id: { start: 0n, end: 10n, scan_key: 'test' },
  tree_depth: 0,
  current_block_progress: 0n,
  time_stamp: new Date('2022-07-01T09:59:29.035Z'),
  is_leaf_node: true,
  parent_id: { start: 0n, end: 1n, scan_key: 'test' },
};

const mongoSource = new MongoSource(db as any);
const blockRangeScanMongoSource = new BlockRangeScanMongoSource(mongoSource);

describe('Block Range scan repository Unit tests', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('2022-06-24T19:01:30.911Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('"startNextScan" should return a result with BlockRangeScan object', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const startNextScanMock = jest
      .spyOn(blockRangeScanMongoSource, 'startNextScan')
      .mockImplementation(() => dto as any);

    const result = await repo.startNextScan('test');

    expect(result.content).toBeInstanceOf(BlockRangeScan);

    startNextScanMock.mockClear();
  });

  it('"startNextScan" should return a failure with NoBlockRangeFoundError when no block range nodewas found for the given key', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const startNextScanMock = jest
      .spyOn(blockRangeScanMongoSource, 'startNextScan')
      .mockImplementation(() => null);
    const result = await repo.startNextScan('test');

    expect(result.content).toBeUndefined();
    expect(result.failure.error).toBeInstanceOf(NoBlockRangeFoundError);

    startNextScanMock.mockClear();
  });

  it('"startNextScan" should return a failure with NoBlockRangeFoundError when no block range nodewas found for the given key', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const startNextScanMock = jest
      .spyOn(blockRangeScanMongoSource, 'startNextScan')
      .mockImplementation(() => {
        throw new Error();
      });
    const result = await repo.startNextScan('test');

    expect(result.content).toBeUndefined();
    expect(result.failure.error).toBeInstanceOf(Error);

    startNextScanMock.mockClear();
  });

  it('"createScanNodes" should insert multiple scan nodes to the source', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const createChildRangesMock = jest.fn().mockImplementation(() => []);

    BlockRangeScan.createChildRanges = createChildRangesMock;
    const insertManyMock = jest
      .spyOn(blockRangeScanMongoSource, 'insertMany')
      .mockImplementation(async () => ['foo', 'bar']);

    const result = await repo.createScanNodes('test', 0n, 1n);

    expect(createChildRangesMock).toBeCalled();
    expect(insertManyMock).toBeCalled();
    expect(result.content).toEqual(['foo', 'bar']);
    expect(result.failure).toBeUndefined();

    insertManyMock.mockClear();
    createChildRangesMock.mockClear();
  });

  it('"createScanNodes" should return a failure on any error', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const createMock = jest.fn().mockImplementation(() => {
      throw new Error();
    });
    BlockRangeScan.create = createMock;

    const result = await repo.createScanNodes('test', 0n, 1n);

    expect(createMock).toBeCalled();
    expect(result.failure).toBeInstanceOf(Failure);

    createMock.mockClear();
  });

  it('"countScanNodes" should result with number of nodes', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const countScanNodesMock = jest
      .spyOn(blockRangeScanMongoSource, 'countScanNodes')
      .mockImplementation(async () => 6);

    const result = await repo.countScanNodes('test', 0n, 1n);

    expect(countScanNodesMock).toBeCalled();
    expect(result.content).toEqual(6);
    expect(result.failure).toBeUndefined();

    countScanNodesMock.mockClear();
  });

  it('"countScanNodes" should return a failure on any error', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const countScanNodesMock = jest
      .spyOn(blockRangeScanMongoSource, 'countScanNodes')
      .mockImplementation(async () => {
        throw new Error();
      });

    const result = await repo.countScanNodes('test', 0n, 1n);

    expect(result.failure).toBeInstanceOf(Failure);

    countScanNodesMock.mockClear();
  });

  it('"removeAll" should result with number of nodes', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const removeAllMock = jest
      .spyOn(blockRangeScanMongoSource, 'removeAll')
      .mockImplementation();

    const result = await repo.removeAll('test');

    expect(removeAllMock).toBeCalled();
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();

    removeAllMock.mockClear();
  });

  it('"removeAll" should return a failure on any error', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const removeAllMock = jest
      .spyOn(blockRangeScanMongoSource, 'removeAll')
      .mockImplementation(async () => {
        throw new Error();
      });

    const result = await repo.removeAll('test');

    expect(result.failure).toBeInstanceOf(Failure);

    removeAllMock.mockClear();
  });

  it('"hasScanKey" should result with boolean value', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const hasScanKeyMock = jest
      .spyOn(blockRangeScanMongoSource, 'hasScanKey')
      .mockImplementation(async () => true);

    const result = await repo.hasScanKey('test');

    expect(hasScanKeyMock).toBeCalled();
    expect(result.content).toEqual(true);
    expect(result.failure).toBeUndefined();

    hasScanKeyMock.mockClear();
  });

  it('"hasScanKey" should return a failure on any error', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const hasScanKeyMock = jest
      .spyOn(blockRangeScanMongoSource, 'hasScanKey')
      .mockImplementation(async () => {
        throw new Error();
      });

    const result = await repo.hasScanKey('test');

    expect(result.failure).toBeInstanceOf(Failure);

    hasScanKeyMock.mockClear();
  });

  it('"hasUnscannedNodes" should result with boolean value', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const hasUnscannedNodesMock = jest
      .spyOn(blockRangeScanMongoSource, 'hasUnscannedNodes')
      .mockImplementation(async () => true);

    const result = await repo.hasUnscannedNodes('test');

    expect(hasUnscannedNodesMock).toBeCalled();
    expect(result.content).toEqual(true);
    expect(result.failure).toBeUndefined();

    hasUnscannedNodesMock.mockClear();
  });

  it('"hasUnscannedNodes" should return a failure on any error', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const hasUnscannedNodesMock = jest
      .spyOn(blockRangeScanMongoSource, 'hasUnscannedNodes')
      .mockImplementation(async () => {
        throw new Error();
      });

    const result = await repo.hasUnscannedNodes('test');

    expect(result.failure).toBeInstanceOf(Failure);

    hasUnscannedNodesMock.mockClear();
  });

  it('"updateScannedBlockNumber" should call source.updateProcessedBlockNumber and result with no content', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const updateScannedBlockNumberMock = jest
      .spyOn(blockRangeScanMongoSource, 'updateProcessedBlockNumber')
      .mockImplementation();

    const result = await repo.updateScannedBlockNumber('test', 0n);

    expect(updateScannedBlockNumberMock).toBeCalled();
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();

    updateScannedBlockNumberMock.mockClear();
  });

  it('"updateScannedBlockNumber" should return a failure on any error', async () => {
    const repo = new BlockRangeScanRepositoryImpl(
      blockRangeScanMongoSource,
      config
    );
    const updateScannedBlockNumberMock = jest
      .spyOn(blockRangeScanMongoSource, 'updateProcessedBlockNumber')
      .mockImplementation(async () => {
        throw new Error();
      });

    const result = await repo.updateScannedBlockNumber('test', 0n);

    expect(result.failure).toBeInstanceOf(Failure);

    updateScannedBlockNumberMock.mockClear();
  });
});
