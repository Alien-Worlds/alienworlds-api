/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  BlockRangeScan,
  BlockRangeScanParent,
} from '@common/block-range-scan/domain/entities/block-range-scan';
import { Long } from 'mongodb';

const list = [
  {
    end: 2n,
    isLeafNode: true,
    parent: {
      end: 5n,
      scanKey: 'test',
      start: 0n,
    },
    scanKey: 'test',
    start: 0n,
    treeDepth: 2,
  },
  {
    end: 4n,
    isLeafNode: true,
    parent: {
      end: 5n,
      scanKey: 'test',
      start: 0n,
    },
    scanKey: 'test',
    start: 2n,
    treeDepth: 2,
  },
  {
    end: 5n,
    isLeafNode: true,
    parent: {
      end: 5n,
      scanKey: 'test',
      start: 0n,
    },
    scanKey: 'test',
    start: 4n,
    treeDepth: 2,
  },
  {
    end: 5n,

    parent: {
      end: 10n,
      scanKey: 'test',
      start: 0n,
    },
    scanKey: 'test',
    start: 0n,
    treeDepth: 1,
  },
  {
    end: 7n,
    isLeafNode: true,
    parent: {
      end: 10n,
      scanKey: 'test',
      start: 5n,
    },
    scanKey: 'test',
    start: 5n,
    treeDepth: 2,
  },
  {
    end: 9n,
    isLeafNode: true,
    parent: {
      end: 10n,
      scanKey: 'test',
      start: 5n,
    },
    scanKey: 'test',
    start: 7n,
    treeDepth: 2,
  },
  {
    end: 10n,
    isLeafNode: true,
    parent: {
      end: 10n,
      scanKey: 'test',
      start: 5n,
    },
    scanKey: 'test',
    start: 9n,
    treeDepth: 2,
  },
  {
    end: 10n,
    parent: {
      end: 10n,
      scanKey: 'test',
      start: 0n,
    },
    scanKey: 'test',
    start: 5n,
    treeDepth: 1,
  },
];

const document = {
  _id: {
    start: Long.fromBigInt(1n),
    end: Long.fromBigInt(2n),
    scan_key: 'test',
  },
  tree_depth: 0,
  current_block_progress: Long.fromBigInt(1n),
  time_stamp: new Date('2022-06-24T19:01:30.911Z'),
  is_leaf_node: false,
  parent_id: {
    start: Long.fromBigInt(0n),
    end: Long.fromBigInt(10n),
    scan_key: 'test',
  },
};

describe('Block Range scan entity Unit tests', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('2022-06-24T19:01:30.911Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('"create" should create an entity based on data', async () => {
    const parent = BlockRangeScanParent.create(0n, 10n, 'test');
    const entity = BlockRangeScan.create(
      1n,
      2n,
      'test',
      0,
      parent,
      false,
      0n,
      new Date('2022-06-24T19:01:30.911Z')
    );

    expect(entity.currentBlockProgress).toEqual(0n);
    expect(entity.start).toEqual(1n);
    expect(entity.end).toEqual(2n);
    expect(entity.isLeafNode).toEqual(false);
    expect(entity.timestamp.toISOString()).toEqual('2022-06-24T19:01:30.911Z');
    expect(entity.parent.start).toEqual(0n);
    expect(entity.parent.end).toEqual(10n);
    expect(entity.parent.scanKey).toEqual('test');
    expect(entity.scanKey).toEqual('test');
    expect(entity.treeDepth).toEqual(0);
  });

  it('"fromDocument" should create an entity based on source document', async () => {
    const entity = BlockRangeScan.fromDocument(document);

    expect(entity.currentBlockProgress).toEqual(1n);
    expect(entity.start).toEqual(1n);
    expect(entity.end).toEqual(2n);
    expect(entity.isLeafNode).toEqual(false);
    expect(entity.timestamp.toISOString()).toEqual('2022-06-24T19:01:30.911Z');
    expect(entity.parent.start).toEqual(0n);
    expect(entity.parent.end).toEqual(10n);
    expect(entity.parent.scanKey).toEqual('test');
    expect(entity.scanKey).toEqual('test');
    expect(entity.treeDepth).toEqual(0);
  });

  it('"createChildRanges" should create an entity based on source document', async () => {
    const ranges = BlockRangeScan.createChildRanges(
      BlockRangeScan.create(0n, 10n, 'test', 0),
      2,
      4
    );
    const jsons = ranges.map(range => range.toJson());

    expect(jsons).toEqual(list);
  });

  it('"setAsLeafNode" should set isLeafNode prop to true', async () => {
    const entity = BlockRangeScan.fromDocument(document);

    expect(entity.isLeafNode).toEqual(false);
    entity.setAsLeafNode();
    expect(entity.isLeafNode).toEqual(true);
  });

  it('"toDocument" should create source document based on entity', async () => {
    const entity = BlockRangeScan.fromDocument(document);
    expect(entity.toDocument()).toEqual(document);
  });

  it('"toJson" should create json object based on entity', async () => {
    const entity = BlockRangeScan.fromDocument(document);
    expect(entity.toJson()).toEqual({
      currentBlockProgress: 1n,
      end: 2n,
      isLeafNode: false,
      parent: {
        end: 10n,
        scanKey: 'test',
        start: 0n,
      },
      scanKey: 'test',
      start: 1n,
      timestamp: new Date('2022-06-24T19:01:30.911Z'),
      treeDepth: 0,
    });
  });
});
