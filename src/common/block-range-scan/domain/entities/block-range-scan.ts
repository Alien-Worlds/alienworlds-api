/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BlockRangeScanDocument,
  BlockRangeScanIdDocument,
} from '@common/block-range-scan/data/block-range-scan.dtos';
import {
  parseToBigInt,
  removeUndefinedProperties,
} from '@common/utils/dto.utils';
import { Long } from 'mongodb';

export class BlockRangeScanParent {
  /**
   * @constructor
   * @private
   * @param {bigint} start
   * @param {bigint} end
   * @param {string} scanKey
   */
  private constructor(
    public readonly start: bigint,
    public readonly end: bigint,
    public readonly scanKey: string
  ) {}

  public static create(start: bigint, end: bigint, scanKey: string) {
    return new BlockRangeScanParent(start, end, scanKey);
  }

  public static fromDocument(document: BlockRangeScanIdDocument) {
    const { start, end, scan_key } = document;

    return new BlockRangeScanParent(
      parseToBigInt(start),
      parseToBigInt(end),
      scan_key
    );
  }

  public toDocument() {
    const doc = {
      start: Long.fromString(this.start.toString()),
      end: Long.fromString(this.end.toString()),
      scan_key: this.scanKey,
    };

    return doc;
  }

  public toJson() {
    const { start, end, scanKey } = this;

    return { start, end, scanKey };
  }
}

/**
 * @class
 */
export class BlockRangeScan {
  protected constructor(
    public readonly start: bigint,
    public readonly end: bigint,
    public readonly scanKey: string,
    public readonly treeDepth: number,
    public readonly parent?: BlockRangeScanParent,
    public isLeafNode?: boolean,
    public readonly currentBlockProgress?: bigint,
    public readonly timestamp?: Date
  ) {}

  /**
   * Create instance of the BlockRangeScanNode
   *
   * @static
   * @param {bigint | number | string} startBlock
   * @param {bigint | number | string} endBlock
   * @param {string} scanKey
   * @param {number} treeDepth
   * @param {BlockRangeScanParent=} parent
   * @param {boolean} isLeafNode
   * @param {bigint | number | string} currentBlockProgress
   * @param {Date} timestamp
   * @returns {BlockRangeScan}
   */
  public static create(
    startBlock: bigint | number | string,
    endBlock: bigint | number | string,
    scanKey: string,
    treeDepth: number,
    parent?: BlockRangeScanParent,
    isLeafNode?: boolean,
    currentBlockProgress?: bigint | number | string,
    timestamp?: Date
  ): BlockRangeScan {
    let currentRangeAsBigInt: bigint;

    if (
      typeof currentBlockProgress === 'bigint' ||
      typeof currentBlockProgress === 'number' ||
      typeof currentBlockProgress === 'string'
    ) {
      currentRangeAsBigInt = parseToBigInt(currentBlockProgress);
    }

    return new BlockRangeScan(
      parseToBigInt(startBlock),
      parseToBigInt(endBlock),
      scanKey,
      treeDepth,
      parent,
      isLeafNode,
      currentRangeAsBigInt,
      timestamp
    );
  }

  public static fromDocument(document: BlockRangeScanDocument) {
    const {
      _id: { start, end, scan_key },
      current_block_progress,
      time_stamp,
      tree_depth,
      parent_id,
      is_leaf_node,
    } = document;

    const parent = parent_id
      ? BlockRangeScanParent.fromDocument(parent_id)
      : null;

    let currentBlockProgress: bigint;

    if (current_block_progress) {
      currentBlockProgress = parseToBigInt(current_block_progress);
    }

    return new BlockRangeScan(
      parseToBigInt(start),
      parseToBigInt(end),
      scan_key,
      tree_depth,
      parent,
      is_leaf_node,
      currentBlockProgress,
      time_stamp
    );
  }

  public static createChildRanges(
    blockRange: BlockRangeScan,
    numberOfChildren: number,
    maxChunkSize: number
  ): BlockRangeScan[] {
    const {
      start: parentStart,
      end: parentEnd,
      scanKey,
      treeDepth,
    } = blockRange;
    const chunkSize = (parentEnd - parentStart) / BigInt(numberOfChildren);
    const rangesToPersist: BlockRangeScan[] = [];
    let start = parentStart;

    while (start < parentEnd) {
      const x = start + BigInt(chunkSize);
      const end = x < parentEnd ? x : parentEnd;
      const range = BlockRangeScan.create(
        start,
        end,
        scanKey,
        treeDepth + 1,
        BlockRangeScanParent.create(parentStart, parentEnd, scanKey)
      );

      if (end - start > maxChunkSize) {
        const childRanges = BlockRangeScan.createChildRanges(
          range,
          numberOfChildren,
          maxChunkSize
        );
        childRanges.forEach(range => rangesToPersist.push(range));
      } else {
        range.setAsLeafNode();
      }

      rangesToPersist.push(range);
      start += chunkSize;
    }

    return rangesToPersist;
  }

  public setAsLeafNode() {
    this.isLeafNode = true;
  }

  public toDocument() {
    const doc: BlockRangeScanDocument = {
      _id: {
        start: Long.fromString(this.start.toString()),
        end: Long.fromString(this.end.toString()),
        scan_key: this.scanKey,
      },
      tree_depth: this.treeDepth,
    };

    if (typeof this.currentBlockProgress == 'bigint') {
      doc.current_block_progress = Long.fromString(
        this.currentBlockProgress.toString()
      );
    }

    if (typeof this.isLeafNode == 'boolean') {
      doc.is_leaf_node = this.isLeafNode;
    }

    if (this.parent) {
      doc.parent_id = this.parent.toDocument();
    }

    if (this.timestamp) {
      doc.time_stamp = this.timestamp;
    }

    return doc;
  }

  public toJson() {
    const {
      start,
      end,
      scanKey,
      isLeafNode,
      treeDepth,
      timestamp,
      currentBlockProgress,
    } = this;

    const json = {
      start,
      end,
      scanKey,
      isLeafNode,
      treeDepth,
      timestamp,
      currentBlockProgress,
    } as any;

    if (this.parent) {
      json.parent = this.parent.toJson();
    }

    return removeUndefinedProperties(json);
  }
}
