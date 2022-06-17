/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { InvalidMessageQueueError } from '../../../domain/errors/invalid-message-queue.error';
import { Failure } from '@core/architecture/domain/failure';
import { MessageRepositoryImpl } from '../message.repository-impl';
import { QueueName } from '@common/data-processing-queue/domain/data-processing-queue.enums';

const paramsDto = {
  invalid: 0,
  error: 'error',
  delay: 0,
  difficulty: 1,
  ease: 1,
  luck: 1,
  commission: 1,
};
const dto = {
  _id: 'fake.id',
  miner: 'fake.miner',
  params: paramsDto,
  bounty: 0,
  land_id: 'fake.land_id',
  planet_name: 'fake.planet',
  landowner: 'fake.landowner',
  bag_items: [0n],
  offset: 0,
  block_num: 0n,
  block_timestamp: new Date(1642706981000),
  global_sequence: 0n,
  tx_id: '92f0f074f841cafba129c28f65e551f022f7a2b5ba2fdc3463291fc7aee29ce1',
};

const messagesMock = {
  send: () => {},
  ack: () => {},
  reject: () => {},
  consume: () => {},
};

describe('MessageRepositoryImpl Unit tests', () => {
  it('"send" should return a failure when queue is not defined', async () => {
    const repository = new MessageRepositoryImpl(messagesMock as any, null);
    const result = await repository.queueMessage(Buffer.from([]));
    expect(result.content).toBeUndefined();
    expect(result.failure.error).toBeInstanceOf(InvalidMessageQueueError);
  });

  it('"send" should return a failure when sending a message has failed', async () => {
    messagesMock.send = () => {
      throw new Error('send error');
    };
    const repository = new MessageRepositoryImpl(
      messagesMock as any,
      QueueName.Action
    );
    const result = await repository.queueMessage(Buffer.from([]));
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"send" should return the result with no content when sending was successful', async () => {
    messagesMock.send = () => {};
    const repository = new MessageRepositoryImpl(
      messagesMock as any,
      QueueName.Action
    );
    const result = await repository.queueMessage(Buffer.from([]));
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();
  });

  it('"ack" should acknowledge message', async () => {
    messagesMock.ack = () => {};
    const repository = new MessageRepositoryImpl(
      messagesMock as any,
      QueueName.Action
    );
    const ackMock = jest.spyOn(messagesMock, 'ack');

    repository.ack({} as any);
    expect(ackMock).toBeCalled();

    ackMock.mockClear();
  });

  it('"reject" should reject message', async () => {
    messagesMock.reject = () => {};
    const repository = new MessageRepositoryImpl(
      messagesMock as any,
      QueueName.Action
    );
    const rejectMock = jest.spyOn(messagesMock, 'reject');

    repository.reject({} as any);
    expect(rejectMock).toBeCalled();

    rejectMock.mockClear();
  });

  it('"ack" should return a failure when message has not been acknowledged', async () => {
    messagesMock.ack = () => {
      throw new Error('send error');
    };
    const repository = new MessageRepositoryImpl(
      messagesMock as any,
      QueueName.Action
    );
    //@ts-ignore
    const result = await repository.ack({} as any);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"ack" should return the result with no content when message has been acknowledged', async () => {
    messagesMock.ack = () => {};
    const repository = new MessageRepositoryImpl(
      messagesMock as any,
      QueueName.Action
    );
    //@ts-ignore
    const result = await repository.ack({} as any);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();
  });

  it('"reject" should return a failure when message was not rejected', async () => {
    messagesMock.reject = () => {
      throw new Error('send error');
    };
    const repository = new MessageRepositoryImpl(
      messagesMock as any,
      QueueName.Action
    );
    //@ts-ignore
    const result = await repository.reject({} as any);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"reject" should return the result with no content when message has been rejected', async () => {
    messagesMock.reject = () => {};
    const repository = new MessageRepositoryImpl(
      messagesMock as any,
      QueueName.Action
    );
    //@ts-ignore
    const result = await repository.reject({} as any);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();
  });

  it('"consume" should return a failure when message was not consumed', async () => {
    messagesMock.consume = () => {
      throw new Error('send error');
    };
    const repository = new MessageRepositoryImpl(
      messagesMock as any,
      QueueName.Action
    );
    const result = await repository.addMessageHandler({} as any);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"consume" should return the result with no content when message has been consumed', async () => {
    messagesMock.consume = () => {};
    const repository = new MessageRepositoryImpl(
      messagesMock as any,
      QueueName.Action
    );
    const result = await repository.addMessageHandler({} as any);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();
  });
});
