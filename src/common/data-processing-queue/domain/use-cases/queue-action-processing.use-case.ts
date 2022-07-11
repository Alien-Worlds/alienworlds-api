import { inject, injectable } from 'inversify';
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
    const queueResult = await this.actionProcessingQueueService.queueJob(
      ActionProcessingJob.createBuffer(blockNumber, action, traceId, timestamp)
    );

    if (queueResult.isFailure) {
      return Result.withFailure(queueResult.failure);
    }

    return Result.withoutContent();
  }
}
