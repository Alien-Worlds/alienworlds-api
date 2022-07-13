import { BlockNumberOutOfRangeError } from '@common/block-range-scan/domain/errors/block-number-out-of-range.error';
import { parseToBigInt } from '@common/utils/dto.utils';
import { CollectionMongoSource } from '@core/storage/data-sources/collection.mongo.source';
import { MongoSource } from '@core/storage/data-sources/mongo.source';
import { Long } from 'mongodb';
import { BlockRangeScanDocument } from '../block-range-scan.dtos';

/**
 * Block range scan nodes data source from the mongo database
 * @class
 */
export class BlockRangeScanMongoSource extends CollectionMongoSource<BlockRangeScanDocument> {
  public static Token = 'BLOCK_RANGE_SCAN_MONGO_SOURCE';

  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(mongoSource: MongoSource) {
    super(mongoSource, 'block_range_scans');
  }

  private async setCurrentBlockProgress(
    document: BlockRangeScanDocument,
    processedBlockNumber: bigint
  ) {
    const { _id, is_leaf_node } = document;
    const { start, end } = _id;

    if (!is_leaf_node) {
      throw new Error(
        `(${start}-${end}) range has already completed scanning the blockchain.`
      );
    }

    if (processedBlockNumber == parseToBigInt(end) - 1n) {
      await this.findCompletedParentNode(document);
    } else {
      await this.collection.updateOne(
        { _id },
        {
          $set: {
            current_block_progress: Long.fromBigInt(processedBlockNumber),
            time_stamp: new Date(),
          },
        }
      );
    }
  }

  public async startNextScan(scanKey: string): Promise<BlockRangeScanDocument> {
    const result = await this.collection.findOneAndUpdate(
      {
        $and: [
          { is_leaf_node: true },
          {
            $or: [
              { time_stamp: { $exists: false } },
              /*
              The trick to not use the same block range again on another thread/worker
              ...Probably this could be handled better.
              */
              { time_stamp: { $lt: new Date(Date.now() - 1000) } },
            ],
          },
          { '_id.scan_key': scanKey },
        ],
      },
      { $set: { time_stamp: new Date() } },
      {
        sort: { time_stamp: 1 },
        returnDocument: 'after',
      }
    );
    const document = await result.value;
    return document;
  }

  public async countScanNodes(
    scanKey: string,
    startBlock: bigint,
    endBlock: bigint
  ): Promise<number> {
    const options: unknown[] = [{ '_id.scan_key': scanKey }];

    if (startBlock) {
      options.push({ '_id.start': { $gte: Long.fromBigInt(startBlock) } });
    }

    if (endBlock) {
      options.push({ '_id.end': { $lte: Long.fromBigInt(endBlock) } });
    }

    const result = await this.collection.countDocuments({
      $and: options,
    });

    return result;
  }

  public async removeAll(scanKey: string) {
    await this.collection.deleteMany({ '_id.scan_key': scanKey });
  }

  public async hasScanKey(
    scanKey: string,
    startBlock?: bigint,
    endBlock?: bigint
  ): Promise<boolean> {
    const options: unknown[] = [{ '_id.scan_key': scanKey }];

    if (startBlock) {
      options.push({ '_id.start': Long.fromBigInt(startBlock) });
    }

    if (endBlock) {
      options.push({ '_id.end': Long.fromBigInt(endBlock) });
    }
    const dto = await this.collection.findOne({ $and: options });

    return !!dto;
  }

  public async hasUnscannedNodes(
    scanKey: string,
    startBlock?: bigint,
    endBlock?: bigint
  ): Promise<boolean> {
    const options: unknown[] = [
      { '_id.scan_key': scanKey },
      { tree_depth: { $gt: 0 } },
      { is_leaf_node: true },
    ];

    if (startBlock) {
      options.push({ 'parent_id.start': Long.fromBigInt(startBlock) });
    }

    if (endBlock) {
      options.push({ 'parent_id.end': Long.fromBigInt(endBlock) });
    }

    const dto = await this.collection.findOne({ $and: options });

    return !!dto;
  }

  public async findRangeForBlockNumber(blockNumber: bigint, scanKey: string) {
    const result = await this.collection.find(
      {
        '_id.start': { $lte: Long.fromBigInt(blockNumber) },
        '_id.end': { $gt: Long.fromBigInt(blockNumber) },
        '_id.scan_key': scanKey,
      },
      { sort: { tree_depth: -1 } }
    );
    const document = await result.next();
    return document;
  }

  public async findCompletedParentNode(document: BlockRangeScanDocument) {
    const { _id, parent_id } = document;

    if (parent_id) {
      await this.collection.deleteOne({ _id });
      // fetch all child nodes with parent id that matches this parent_id
      const matchingParentCount = await this.collection.countDocuments({
        parent_id,
      });
      if (matchingParentCount == 0) {
        const parentDocument = await this.collection.findOne({
          _id: parent_id,
        });
        await this.findCompletedParentNode(parentDocument);
      }
    }
  }

  public async updateProcessedBlockNumber(
    scanKey: string,
    blockNumber: bigint
  ): Promise<void> {
    const range = await this.findRangeForBlockNumber(blockNumber, scanKey);

    if (range) {
      return this.setCurrentBlockProgress(range, blockNumber);
    }

    throw new BlockNumberOutOfRangeError(blockNumber, scanKey);
  }
}
