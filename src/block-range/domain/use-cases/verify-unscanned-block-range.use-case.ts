import { BlockRangeScanRepository } from '@common/block-range-scan/domain/repositories/block-range-scan.repository';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { Failure } from '@core/architecture/domain/failure';
import { BlockRangeScanReadTimeoutError } from '../errors/block-range-scan-read-timeout.error';

/**
 * @class
 */
@injectable()
export class VerifyUnscannedBlockRangeUseCase implements UseCase<boolean> {
  public static Token = 'VERIFY_UNSCANNED_BLOCK_RANGE_USE_CASE';

  @inject(BlockRangeScanRepository.Token)
  private blockRangeScanRepository: BlockRangeScanRepository;

  /**
   *
   *
   * @returns {Result<void>}
   */
  public async execute(
    scanKey: string,
    maxAttempts = 10
  ): Promise<Result<boolean>> {
    let checkFailure: Failure;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { content: hasUnscannedNodes, failure } =
        await this.blockRangeScanRepository.hasUnscannedNodes(scanKey);

      if (hasUnscannedNodes) {
        return Result.withContent(true);
      }

      checkFailure = failure;
    }

    return Result.withFailure(
      Failure.fromError(
        new BlockRangeScanReadTimeoutError(
          checkFailure ? checkFailure.error : null
        )
      )
    );
  }
}
