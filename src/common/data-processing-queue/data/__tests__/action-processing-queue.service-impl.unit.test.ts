/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MessageRepositoryImpl } from '@core/messaging/data/repositories/message.repository-impl';
import { ActionProcessingQueueServiceImpl } from '../action-processing-queue.service-impl';

jest.mock('@core/messaging/data/repositories/message.repository-impl');

const MessageRepositoryImplMock = MessageRepositoryImpl as jest.MockedClass<
  typeof MessageRepositoryImpl
>;

describe('Action processing queue service Unit tests', () => {
  it('"addJobHandler" should call message repository addMessageHandler method', () => {
    const repo = new MessageRepositoryImpl({} as any, 'queue');
    const queue = new ActionProcessingQueueServiceImpl(repo);
    queue.addJobHandler(async () => {});

    expect(MessageRepositoryImplMock.prototype.addMessageHandler).toBeCalled();
  });
});
