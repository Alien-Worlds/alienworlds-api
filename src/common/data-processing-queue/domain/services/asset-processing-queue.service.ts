import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { AssetProcessingJob } from '../entities/asset-processing.job';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class AssetProcessingQueueService {
  public static Token = 'ASSET_PROCESSING_QUEUE_SERVICE';

  public abstract queueJob(job: Buffer): Promise<Result<void>>;
  public abstract ackJob(job: AssetProcessingJob): Result<void>;
  public abstract rejectJob(job: AssetProcessingJob): Result<void>;
  public abstract addJobHandler(
    handler: (job: AssetProcessingJob) => Promise<void>
  ): Result<void>;
}
