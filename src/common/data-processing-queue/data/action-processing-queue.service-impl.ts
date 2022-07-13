/* eslint-disable @typescript-eslint/no-unused-vars */
import { Result } from '@core/architecture/domain/result';
import { ActionProcessingQueueService } from '../domain/services/action-processing-queue.service';
import { Message } from '@core/messaging/domain/entities/message';
import { ActionProcessingJob } from '../domain/entities/action-processing.job';
import { DataProcessingQueueServiceImpl } from './data-processing-queue.service-impl';

export class ActionProcessingQueueServiceImpl
  extends DataProcessingQueueServiceImpl<ActionProcessingJob>
  implements ActionProcessingQueueService
{
  public addJobHandler(
    handler: (job: ActionProcessingJob) => Promise<void>
  ): Result<void, Error> {
    return this.messageRepository.addMessageHandler((message: Message) =>
      handler(ActionProcessingJob.fromMessage(message))
    );
  }
}
