import { StateHistoryService } from '@common/state-history/domain/state-history.service';
import { log } from '@common/state-history/domain/state-history.utils';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import {
  WorkerMessage,
  WorkerMessageType,
} from '@core/architecture/workers/worker-message';
import { WorkerOrchestrator } from '@core/architecture/workers/worker-orchestrator';
import { inject, injectable } from 'inversify';
import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { BlockRangeInfo } from '../block-range.enums';

/**
 * @class
 */
@injectable()
export class CompleteBlockRangeScanUseCase implements UseCase<void> {
  public static Token = 'COMPLETE_BLOCK_RANGE_SCAN_USE_CASE';

  @inject(StateHistoryService.Token)
  private stateHistoryService: StateHistoryService;

  /**
   *
   *
   * @returns {Result<void>}
   */
  public async execute(blockRange: BlockRange): Promise<Result<void>> {
    log('Completed blocks range', blockRange);

    const { failure: disconnectFailure } =
      await this.stateHistoryService.disconnect();

    // In case of an error, send it to the orchestrator
    if (disconnectFailure) {
      WorkerOrchestrator.sendToOrchestrator(
        WorkerMessage.fromError(process.pid, disconnectFailure.error)
      );
    } else {
      WorkerOrchestrator.sendToOrchestrator(
        WorkerMessage.create({
          pid: process.pid,
          type: WorkerMessageType.Info,
          name: BlockRangeInfo.ScanComplete,
        })
      );
    }

    return Result.withoutContent();
  }
}
