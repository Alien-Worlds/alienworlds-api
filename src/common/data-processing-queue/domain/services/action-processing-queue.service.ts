import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { ActionProcessingJob } from '../entities/action-processing.job';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class ActionProcessingQueueService {
  public static Token = 'ACTION_PROCESSING_QUEUE_SERVICE';

  public abstract queueJob(job: Buffer): Promise<Result<void>>;
  public abstract ackJob(job: ActionProcessingJob): Result<void>;
  public abstract rejectJob(job: ActionProcessingJob): Result<void>;
  public abstract addJobHandler(
    handler: (job: ActionProcessingJob) => Promise<void>
  ): Result<void>;
}
