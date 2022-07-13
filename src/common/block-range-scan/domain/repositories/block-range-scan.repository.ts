import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { BlockRangeScan } from '../entities/block-range-scan';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class BlockRangeScanRepository {
  public static Token = 'BLOCK_RANGE_SCAN_REPOSITORY';

  public abstract startNextScan(
    scanKey: string
  ): Promise<Result<BlockRangeScan>>;
  public abstract createScanNodes(
    scanKey: string,
    startBlock: bigint,
    endBlock: bigint
  ): Promise<Result<string[]>>;
  public abstract countScanNodes(
    scanKey: string,
    startBlock: bigint,
    endBlock: bigint
  ): Promise<Result<number>>;
  public abstract removeAll(scanKey: string): Promise<Result<void>>;
  public abstract hasScanKey(
    scanKey: string,
    startBlock?: bigint,
    endBlock?: bigint
  ): Promise<Result<boolean>>;
  public abstract hasUnscannedNodes(
    scanKey: string,
    startBlock?: bigint,
    endBlock?: bigint
  ): Promise<Result<boolean>>;
  public abstract updateScannedBlockNumber(
    scanKey: string,
    blockNumber: bigint
  ): Promise<Result<void>>;
}
