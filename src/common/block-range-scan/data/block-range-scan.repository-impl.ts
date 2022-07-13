import { Config } from '@config';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { BlockRangeScanRepository as BlockRangeScanRepository } from '../domain/repositories/block-range-scan.repository';
import { BlockRangeScan } from '../domain/entities/block-range-scan';
import { NoBlockRangeFoundError } from '../domain/errors/no-block-range.found.error';
import { BlockRangeScanMongoSource } from './data-sources/block-range-scan.mongo.source';

export class BlockRangeScanRepositoryImpl implements BlockRangeScanRepository {
  constructor(
    private readonly source: BlockRangeScanMongoSource,
    private readonly config: Config
  ) {}

  public async startNextScan(
    scanKey: string
  ): Promise<Result<BlockRangeScan, Error>> {
    try {
      const document = await this.source.startNextScan(scanKey);
      if (document) {
        return Result.withContent(BlockRangeScan.fromDocument(document));
      }
      return Result.withFailure(
        Failure.fromError(new NoBlockRangeFoundError(scanKey))
      );
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async createScanNodes(
    scanKey: string,
    startBlock: bigint,
    endBlock: bigint
  ): Promise<Result<string[]>> {
    try {
      const {
        blockRangeScan: { numberOfChildren, minChunkSize },
      } = this.config;

      const rootRange = BlockRangeScan.create(startBlock, endBlock, scanKey, 0);
      const rangesToPersist = [rootRange];
      const childRanges = BlockRangeScan.createChildRanges(
        rootRange,
        numberOfChildren,
        minChunkSize
      );
      childRanges.forEach(range => rangesToPersist.push(range));

      const documents = rangesToPersist.map(range => range.toDocument());
      const ids = await this.source.insertMany(documents);

      return Result.withContent(ids);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async countScanNodes(
    scanKey: string,
    startBlock: bigint,
    endBlock: bigint
  ): Promise<Result<number, Error>> {
    try {
      const count = await this.source.countScanNodes(
        scanKey,
        startBlock,
        endBlock
      );
      return Result.withContent(count);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async removeAll(scanKey: string): Promise<Result<void, Error>> {
    try {
      await this.source.removeAll(scanKey);
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async hasScanKey(
    scanKey: string,
    startBlock?: bigint,
    endBlock?: bigint
  ): Promise<Result<boolean, Error>> {
    try {
      const hasKey = await this.source.hasScanKey(
        scanKey,
        startBlock,
        endBlock
      );
      return Result.withContent(hasKey);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async hasUnscannedNodes(
    scanKey: string,
    startBlock?: bigint,
    endBlock?: bigint
  ): Promise<Result<boolean, Error>> {
    try {
      const hasUnscanned = await this.source.hasUnscannedNodes(
        scanKey,
        startBlock,
        endBlock
      );
      return Result.withContent(hasUnscanned);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async updateScannedBlockNumber(
    scanKey: string,
    blockNumber: bigint
  ): Promise<Result<void, Error>> {
    try {
      await this.source.updateProcessedBlockNumber(scanKey, blockNumber);
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
