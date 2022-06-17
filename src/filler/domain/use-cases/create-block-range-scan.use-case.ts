import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { BlockRangeScanRepository } from '../../../common/block-range-scan/domain/repositories/block-range-scan.repository';
import { DuplicateBlockRangeScanError } from '../errors/duplicate-block-range-scan.error';

/**
 * @class
 */
@injectable()
export class CreateBlockRangeScanUseCase implements UseCase<string[]> {
  public static Token = 'CREATE_BLOCK_RANGE_SCAN_USE_CASE';

  constructor(
    @inject(BlockRangeScanRepository.Token)
    private blockRangeScanRepository: BlockRangeScanRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @param {bigint} startBlock
   * @param {bigint} endBlock
   * @returns {Promise<Result<void>>}
   */
  public async execute(
    scanKey: string,
    startBlock: bigint,
    endBlock: bigint
  ): Promise<Result<string[]>> {
    const scanKeyCheckResult = await this.blockRangeScanRepository.hasScanKey(
      scanKey,
      startBlock,
      endBlock
    );

    if (scanKeyCheckResult.isFailure) {
      return Result.withFailure(scanKeyCheckResult.failure);
    }

    if (scanKeyCheckResult.content === true) {
      return Result.withFailure(
        Failure.fromError(
          new DuplicateBlockRangeScanError(scanKey, startBlock, endBlock)
        )
      );
    }

    return this.blockRangeScanRepository.createScanNodes(
      scanKey,
      startBlock,
      endBlock
    );
  }
}
