import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { AssetProcessingJob } from '../entities/asset-processing.job';
import { Failure } from '@core/architecture/domain/failure';
import { AssetProcessingQueueService } from '@common/data-processing-queue/domain/services/asset-processing-queue.service';
import { UnqueuedAssetProcessingJobsError } from '../errors/unqueued-asset-processing-jobs.error';

/**
 * @class
 */
@injectable()
export class QueueAssetProcessingUseCase implements UseCase<void> {
  public static Token = 'QUEUE_ASSET_PROCESSING_USE_CASE';

  /**
   * @constructor
   */
  constructor(
    @inject(AssetProcessingQueueService.Token)
    private assetProcessingQueueService: AssetProcessingQueueService
  ) {}

  /**
   *
   * @param {bigint[]} ids
   * @returns {Promise<bigint[]>} list of unqueued ids
   */
  private async queueJobs(ids: bigint[]): Promise<bigint[]> {
    const failures: bigint[] = [];
    for (const id of ids) {
      const queueResult = await this.assetProcessingQueueService.queueJob(
        AssetProcessingJob.createBuffer(id)
      );
      if (queueResult.isFailure) {
        failures.push(id);
      }
    }

    return failures;
  }

  /**
   * @returns {Result<void>}
   */
  public async execute(assetIds: bigint[]): Promise<Result<void>> {
    let tries = 3; //TODO Magic number
    let unqueuedIds = [...assetIds];
    // before returning failure, try to queue id's several times
    // (those that have failed in previous attempts)
    while (tries > 0) {
      unqueuedIds = await this.queueJobs(unqueuedIds);
      if (unqueuedIds.length === 0) {
        tries = 0;
      } else {
        tries--;
      }
    }

    if (unqueuedIds.length > 0) {
      return Result.withFailure(
        Failure.fromError(new UnqueuedAssetProcessingJobsError(unqueuedIds))
      );
    }

    return Result.withoutContent();
  }
}
