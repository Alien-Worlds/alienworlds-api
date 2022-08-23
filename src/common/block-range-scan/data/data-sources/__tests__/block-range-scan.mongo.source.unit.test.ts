/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BlockNumberOutOfRangeError } from '@common/block-range-scan/domain/errors/block-number-out-of-range.error';
import { MongoSource } from '@core/storage/data/data-sources/mongo.source';
import { Long } from 'mongodb';
import { BlockRangeScanMongoSource } from '../block-range-scan.mongo.source';

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

describe('Block Range scan mongo source Unit tests', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('2022-06-24T19:01:30.911Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('"setCurrentBlockProgress" should throw "scanning already completed" error if dto doesn\'t have is_leaf_node prop', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);

    dto.is_leaf_node = undefined;

    await (source as any).setCurrentBlockProgress(dto, 2n).catch(error => {
      expect(error.message).toEqual(
        `(0-10) range has already completed scanning the blockchain.`
      );
    });

    dto.is_leaf_node = true;
  });

  it('"setCurrentBlockProgress" should find completed parent node when processed block number is penultimate in the range', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);

    const findCompletedParentNodeMock = jest
      .spyOn(source, 'findCompletedParentNode')
      .mockImplementation();

    await (source as any).setCurrentBlockProgress(dto, 9n);
    expect(findCompletedParentNodeMock).toBeCalledWith(dto);
  });

  it('"setCurrentBlockProgress" should set current_block_progress and time_stamp in the range node', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);

    await (source as any).setCurrentBlockProgress(dto, 2n);

    const { _id } = dto;
    expect((source as any).collection.updateOne).toBeCalledWith(
      { _id },
      {
        $set: {
          current_block_progress: Long.fromBigInt(2n),
          time_stamp: new Date(),
        },
      }
    );
  });

  it('"startNextScan" should find unscanned or unfinished leaf node, update its time_stamp and return that document', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);
    (source as any).collection.findOneAndUpdate.mockImplementation(() => ({
      value: dto,
    }));
    await (source as any).startNextScan('test');

    expect((source as any).collection.findOneAndUpdate).toBeCalledWith(
      {
        $and: [
          { is_leaf_node: true },
          {
            $or: [
              { time_stamp: { $exists: false } },
              { time_stamp: { $lt: new Date(Date.now() - 1000) } },
            ],
          },
          { '_id.scan_key': 'test' },
        ],
      },
      { $set: { time_stamp: new Date() } },
      {
        sort: { time_stamp: 1 },
        returnDocument: 'after',
      }
    );
  });

  it('"removeAll" should remove all nodes with the provided scan_key', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);
    await (source as any).removeAll('test');

    expect((source as any).collection.deleteMany).toBeCalledWith({
      '_id.scan_key': 'test',
    });
  });

  it('"countScanNodes" should count all nodes with the provided scan_key', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);
    await (source as any).countScanNodes('test');

    expect((source as any).collection.countDocuments).toBeCalledWith({
      $and: [{ '_id.scan_key': 'test' }],
    });
  });

  it('"countScanNodes" should count all nodes with the provided scan_key within range', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);
    await (source as any).countScanNodes('test', 1n, 1n);
    const options = [
      { '_id.scan_key': 'test' },
      { '_id.start': { $gte: Long.fromBigInt(1n) } },
      { '_id.end': { $lte: Long.fromBigInt(1n) } },
    ];
    expect((source as any).collection.countDocuments).toBeCalledWith({
      $and: options,
    });
  });

  it('"hasScanKey" should return true when a matching document is found', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);
    (source as any).collection.findOne.mockImplementation(() => dto);

    await (source as any).hasScanKey('test');

    expect((source as any).collection.findOne).toBeCalledWith({
      $and: [{ '_id.scan_key': 'test' }],
    });
  });

  it('"hasScanKey" should return false when no matching document was found', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);
    (source as any).collection.findOne.mockImplementation(() => null);
    const options = [
      { '_id.scan_key': 'test' },
      { '_id.start': Long.fromBigInt(1n) },
      { '_id.end': Long.fromBigInt(1n) },
    ];
    await (source as any).hasScanKey('test', 1n, 1n);

    expect((source as any).collection.findOne).toBeCalledWith({
      $and: options,
    });
  });

  it('"hasUnscannedNodes" should return true when a matching document is found', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);
    (source as any).collection.findOne.mockImplementation(() => dto);

    await (source as any).hasUnscannedNodes('test');

    expect((source as any).collection.findOne).toBeCalledWith({
      $and: [
        { '_id.scan_key': 'test' },
        { tree_depth: { $gt: 0 } },
        { is_leaf_node: true },
      ],
    });
  });

  it('"hasUnscannedNodes" should return false when no matching document was found', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);
    (source as any).collection.findOne.mockImplementation(() => null);
    const options = [
      { '_id.scan_key': 'test' },
      { tree_depth: { $gt: 0 } },
      { is_leaf_node: true },
      { 'parent_id.start': Long.fromBigInt(1n) },
      { 'parent_id.end': Long.fromBigInt(1n) },
    ];
    await (source as any).hasUnscannedNodes('test', 1n, 1n);

    expect((source as any).collection.findOne).toBeCalledWith({
      $and: options,
    });
  });

  it('"findRangeForBlockNumber" should return a range node that matches the key and contains the given block number in the range', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);
    (source as any).collection.find.mockImplementation(() => ({
      next: () => dto,
    }));

    await (source as any).findRangeForBlockNumber(0n, 'test');

    expect((source as any).collection.find).toBeCalledWith(
      {
        '_id.start': { $lte: Long.fromBigInt(0n) },
        '_id.end': { $gt: Long.fromBigInt(0n) },
        '_id.scan_key': 'test',
      },
      { sort: { tree_depth: -1 } }
    );
  });

  it('"findRangeForBlockNumber" should not do anything when given document has no parent_id', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);

    (source as any).collection.find.mockImplementation(() => ({
      next: () => dto,
    }));

    await (source as any).findCompletedParentNode({});

    expect((source as any).collection.deleteOne).not.toBeCalled();
    expect((source as any).collection.find).not.toBeCalled();
  });

  it('"findRangeForBlockNumber" should remove given document when it contains parent_id and fetch its child nodes', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);

    (source as any).collection.find.mockImplementation(async () => ({
      count: () => 1,
    }));

    await (source as any).findCompletedParentNode(dto);

    expect((source as any).collection.deleteOne).toBeCalledWith({
      _id: dto._id,
    });
    expect((source as any).collection.countDocuments).toBeCalledWith({
      parent_id: dto.parent_id,
    });
  });

  it('"updateProcessedBlockNumber" should call findCompletedParentNode on parent node if no child nodes were found', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);
    const findRangeForBlockNumberMock = jest
      .spyOn(source as any, 'findRangeForBlockNumber')
      .mockImplementation(() => ({}));
    const setCurrentBlockProgressMock = jest
      .spyOn(source as any, 'setCurrentBlockProgress')
      .mockImplementation();

    await source.updateProcessedBlockNumber('test', 0n);

    expect(findRangeForBlockNumberMock).toBeCalled();
    expect(setCurrentBlockProgressMock).toBeCalled();
  });

  it('"updateProcessedBlockNumber" should throw an error when no block range was found', async () => {
    const source = new BlockRangeScanMongoSource(mongoSource);
    const findRangeForBlockNumberMock = jest
      .spyOn(source as any, 'findRangeForBlockNumber')
      .mockImplementation(() => null);

    await source.updateProcessedBlockNumber('test', 0n).catch(error => {
      expect(error).toBeInstanceOf(BlockNumberOutOfRangeError);
    });

    findRangeForBlockNumberMock.mockClear();
  });
});
