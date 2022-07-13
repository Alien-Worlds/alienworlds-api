/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MessageRepositoryImpl } from '@core/messaging/data/repositories/message.repository-impl';
import { DataProcessingQueueServiceImpl } from '../data-processing-queue.service-impl';

jest.mock('@core/messaging/data/repositories/message.repository-impl');

const MessageRepositoryImplMock = MessageRepositoryImpl as jest.MockedClass<
  typeof MessageRepositoryImpl
>;

describe('Data processing queue Unit tests', () => {
  it('"ackJob" should call message repository ack method', () => {
    const repo = new MessageRepositoryImpl({} as any, 'queue');
    const queue = new DataProcessingQueueServiceImpl(repo);
    const job = { message: { id: 'message_id', content: {} } };

    queue.ackJob(job as any);

    expect(MessageRepositoryImplMock.prototype.ack).toBeCalledWith(job.message);
  });

  it('"rejectJob" should call message repository reject method', () => {
    const repo = new MessageRepositoryImpl({} as any, 'queue');
    const queue = new DataProcessingQueueServiceImpl(repo);
    const job = { message: { id: 'message_id', content: {} } };

    queue.rejectJob(job as any);

    expect(MessageRepositoryImplMock.prototype.reject).toBeCalledWith(
      job.message
    );
  });

  it('"queueJob" should call message repository queueMessage method', () => {
    const repo = new MessageRepositoryImpl({} as any, 'queue');
    const queue = new DataProcessingQueueServiceImpl(repo);
    const job = { message: { id: 'message_id', content: {} } };

    queue.queueJob(job as any);

    expect(MessageRepositoryImplMock.prototype.queueMessage).toBeCalledWith(
      job
    );
  });

  it('"addJobHandler" should throw "Method not implemented." error', () => {
    const repo = new MessageRepositoryImpl({} as any, 'queue');
    const queue = new DataProcessingQueueServiceImpl(repo);

    expect(queue.addJobHandler).toThrowError();
  });
});
