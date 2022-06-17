import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { BlockRangeScanRepository } from '../repositories/block-range-scan.repository';
import { BlockRangeScan } from '../entities/block-range-scan';

/**
 * @class
 */
@injectable()
export class StartNextScanUseCase implements UseCase<BlockRangeScan> {
  public static Token = 'START_NEXT_SCAN_USE_CASE';

  constructor(
    @inject(BlockRangeScanRepository.Token)
    private blockRangeScanRepository: BlockRangeScanRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<BlockRangeScan>>}
   */
  public async execute(scanKey: string): Promise<Result<BlockRangeScan>> {
    return await this.blockRangeScanRepository.startNextScan(scanKey);
  }
}
