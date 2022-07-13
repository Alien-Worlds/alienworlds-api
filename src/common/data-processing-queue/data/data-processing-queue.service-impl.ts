/* eslint-disable @typescript-eslint/no-unused-vars */
import { Result } from '@core/architecture/domain/result';
import { MessageRepositoryImpl } from '@core/messaging/data/repositories/message.repository-impl';
import { Job } from '../domain/entities/job';

export class DataProcessingQueueServiceImpl<JobType extends Job> {
  constructor(protected messageRepository: MessageRepositoryImpl) {}

  public async queueJob(job: Buffer): Promise<Result<void, Error>> {
    return this.messageRepository.queueMessage(job);
  }

  public ackJob(job: JobType): Result<void, Error> {
    return this.messageRepository.ack(job.message);
  }

  public rejectJob(job: JobType): Result<void, Error> {
    return this.messageRepository.reject(job.message);
  }

  public addJobHandler(
    handler: (job: JobType) => Promise<void>
  ): Result<void, Error> {
    throw new Error('Method not implemented.');
  }
}
