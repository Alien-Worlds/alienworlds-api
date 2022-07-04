import { inject, injectable } from 'inversify';
import { config } from '@config';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { ActionProcessingJob } from '@common/data-processing-queue/domain/entities/action-processing.job';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { ActionTrace } from '@common/actions/domain/entities/action-trace';

/**
 * @class
 */
@injectable()
export class QueueActionProcessingUseCase implements UseCase<void> {
  public static Token = 'QUEUE_ACTION_PROCESSING_USE_CASE';

  /**
   * @constructor
   */
  constructor(
    @inject(ActionProcessingQueueService.Token)
    private actionProcessingQueueService: ActionProcessingQueueService
  ) {}

  /**
   *
   *
   * @returns {Result<void>}
   */
  public async execute(
    blockNumber: bigint,
    action: ActionTrace,
    traceId: string,
    timestamp: Date
  ): Promise<Result<void>> {
    const { type, receiver, act } = action;

    if (
      type === 'action_trace_v0' &&
      (act.account === config.atomicAssets.contract ||
        act.account === config.miningContract) &&
      act.account === receiver &&
      ['logmine', 'logrand', 'logtransfer', 'logburn', 'logmint'].includes(
        act.name
      )
    ) {
      const queueResult = await this.actionProcessingQueueService.queueJob(
        ActionProcessingJob.createBuffer(
          blockNumber,
          action,
          traceId,
          timestamp
        )
      );

      if (queueResult.isFailure) {
        return Result.withFailure(queueResult.failure);
      }
    }
    return Result.withoutContent();
  }
}
