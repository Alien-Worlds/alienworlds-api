/* eslint-disable @typescript-eslint/no-unused-vars */
import { Result } from '@core/architecture/domain/result';
import { ActionProcessingQueueService } from '../domain/services/action-processing-queue.service';
import { Message } from '@core/messaging/domain/entities/message';
import { ActionProcessingJob } from '../domain/entities/action-processing.job';
import { Failure } from '@core/architecture/domain/failure';
import { MessageKeyAlreadyTakenError } from '@core/messaging/domain/errors/message-key-already-taken.error';
import { MessageNotFoundError } from '@core/messaging/domain/errors/message-not-found.error';
import { DataProcessingQueueServiceImpl } from './data-processing-queue.service-impl';

export class ActionProcessingQueueServiceImpl
  extends DataProcessingQueueServiceImpl<ActionProcessingJob>
  implements ActionProcessingQueueService
{
  private cache: Map<string, ActionProcessingJob> = new Map();

  public addJobHandler(
    handler: (job: ActionProcessingJob) => Promise<void>
  ): Result<void, Error> {
    return this.messageRepository.addMessageHandler((message: Message) =>
      handler(ActionProcessingJob.fromMessage(message))
    );
  }

  /**
   * Store job for later use.
   *
   * @param {string} key
   * @param {ActionProcessingJob} job
   * @returns {Result<void>}
   */
  public cacheJob(key: string, job: ActionProcessingJob): Result<void> {
    if (this.cache.has(key)) {
      return Result.withFailure(
        Failure.fromError(new MessageKeyAlreadyTakenError(key))
      );
    }
    this.cache.set(key, job);
    return Result.withoutContent();
  }

  /**
   * Get job by key.
   *
   * @param {string} key
   * @returns {Result<ActionProcessingJob>}
   */
  public getCachedJob(key: string): Result<ActionProcessingJob> {
    const message = this.cache.get(key);
    if (message) {
      return Result.withContent(message);
    }
    return Result.withFailure(Failure.fromError(new MessageNotFoundError(key)));
  }

  /**
   * Get all stored jobs as an array
   *
   * @returns {Result<ActionProcessingJob[]>}
   */
  public getAllCachedJobs(): Result<ActionProcessingJob[]> {
    return Result.withContent(Array.from(this.cache.values()));
  }

  /**
   * Remove all stored jobs.
   *
   * @returns {Result<void>}
   */
  public clearCache(): Result<void> {
    this.cache.clear();
    return Result.withoutContent();
  }
}
