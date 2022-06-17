import { BlockRangeScanRepository } from '@common/block-range-scan/domain/repositories/block-range-scan.repository';
import { BlockRangeScan } from '@common/block-range-scan/domain/entities/block-range-scan';
import { StateHistoryService } from '@common/state-history/domain/state-history.service';
import { log } from '@common/state-history/domain/state-history.utils';
import { RequestBlocksUseCase } from '@common/state-history/domain/use-cases/request-blocks.use-case';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import {
  WorkerMessage,
  WorkerMessageType,
} from '@core/architecture/workers/worker-message';
import { WorkerOrchestrator } from '@core/architecture/workers/worker-orchestrator';
import { inject, injectable } from 'inversify';
import { BlockRange } from '@common/block-range/domain/entities/block-range';

/**
 * @class
 */
@injectable()
export class CompleteBlockRangeScanUseCase implements UseCase<void> {
  public static Token = 'COMPLETE_BLOCK_RANGE_SCAN_USE_CASE';

  @inject(StateHistoryService.Token)
  private stateHistoryService: StateHistoryService;
  @inject(RequestBlocksUseCase.Token)
  private requestBlocksUseCase: RequestBlocksUseCase;
  @inject(BlockRangeScanRepository.Token)
  private blockRangeScanRepository: BlockRangeScanRepository;

  /**
   *
   *
   * @returns {Result<void>}
   */
  public async execute(
    blockRange: BlockRange,
    scanKey: string
  ): Promise<Result<void>> {
    try {
      log('Completed blocks range', blockRange);
      const disconnectResult = await this.stateHistoryService.disconnect();

      if (disconnectResult.isFailure) {
        throw disconnectResult.failure.error;
      }

      const startNextScanResult =
        await this.blockRangeScanRepository.startNextScan(scanKey);

      if (startNextScanResult.isFailure) {
        throw startNextScanResult.failure.error;
      }
      const {
        content: { start, end },
      } = startNextScanResult;
      const { failure } = await this.requestBlocksUseCase.execute(start, end);

      if (failure) {
        throw failure.error;
      }

      return Result.withoutContent();
    } catch (error) {
      WorkerOrchestrator.sendToOrchestrator(
        WorkerMessage.create({
          pid: process.pid,
          type: WorkerMessageType.Error,
          name: error.name,
          error,
        })
      );
    }
  }
}
