/* eslint-disable @typescript-eslint/no-unused-vars */
import { AssetProcessingQueueService } from '../domain/services/asset-processing-queue.service';
import { AssetProcessingJob } from '../domain/entities/asset-processing.job';
import { DataProcessingQueueServiceImpl } from './data-processing-queue.service-impl';
import { Message } from '@core/messaging/domain/entities/message';
import { Result } from '@core/architecture/domain/result';

export class AssetProcessingQueueServiceImpl
  extends DataProcessingQueueServiceImpl<AssetProcessingJob>
  implements AssetProcessingQueueService
{
  public addJobHandler(
    handler: (job: AssetProcessingJob) => Promise<void>
  ): Result<void, Error> {
    return this.messageRepository.addMessageHandler((message: Message) =>
      handler(AssetProcessingJob.fromMessage(message))
    );
  }
}
