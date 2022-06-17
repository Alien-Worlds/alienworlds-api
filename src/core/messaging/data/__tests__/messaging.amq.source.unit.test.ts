/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'reflect-metadata';

import { connect } from 'amqplib';
import { MessagingAmqSource } from '../data-sources/messaging.amq.source';
import { wait } from '../messaging.utils';

jest.mock('../../messages.utils', () => ({
  wait: jest.fn(),
}));

jest.mock('amqplib', () => ({
  connect: jest.fn(() => ({
    on: jest.fn(() => {}),
    createConfirmChannel: jest.fn(() => ({
      prefetch: jest.fn(),
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
      consume: jest.fn(),
      ack: jest.fn(),
      reject: jest.fn(),
    })),
  })),
}));

const connectMock = connect as jest.MockedFunction<typeof connect>;
const waitMock = wait as jest.MockedFunction<typeof wait>;

describe('Amq instance Unit tests', () => {
  it('Should contain "connection_string" equal to the value given in the constructor', async () => {
    const connectionString = 'some_connection_string';
    const amq = new MessagingAmqSource(
      connectionString,
      { queues: [], prefetch: 1 },
      console
    );
    // @ts-ignore
    expect(amq.address).toEqual(connectionString);
  });

  it('"connect" should connect and add "error" and connection "close" handlers', async () => {
    const connectionString = 'some_connection_string';
    const amq = new MessagingAmqSource(
      connectionString,
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();
    expect(connectMock).toBeCalledWith(connectionString);
  });

  it('"createChannel" should create channel correctly and assert queues "action", "aw_block_range", "recalc_asset"', async () => {
    const connectionString = 'some_connection_string';
    const amq = new MessagingAmqSource(
      connectionString,
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();
    const createConfirmChannelMock = jest.spyOn(
      (amq as any).connection,
      'createConfirmChannel'
    );
    const prefetchMock = jest.spyOn((amq as any).channel, 'prefetch');
    const assertQueueMock = jest.spyOn((amq as any).channel, 'assertQueue');

    expect(createConfirmChannelMock).toBeCalledTimes(1);
    expect(prefetchMock).toBeCalledTimes(1);
    expect(assertQueueMock).toBeCalledWith('MessageQueue.Action', {
      durable: true,
    });
    expect(assertQueueMock).toBeCalledWith(
      'MessageQueue.AlienWorldsBlockRange',
      {
        durable: true,
      }
    );
    expect(assertQueueMock).toBeCalledWith('MessageQueue.RecalcAsset', {
      durable: true,
    });

    createConfirmChannelMock.mockClear();
    prefetchMock.mockClear();
    assertQueueMock.mockClear();
  });

  it('"handleConnectionError" should call Amqp.connect', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    // @ts-ignore
    await amq.handleConnectionError(new Error('connection error'));
    expect(connectMock).toHaveBeenCalled();
  });

  it('"handleConnectionClose" should call Amqp.connect', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    // @ts-ignore
    await amq.handleConnectionClose();
    expect(connectMock).toHaveBeenCalled();
  });

  it('"handleConnectionError" should log error and trigger reconnect', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();
    // @ts-ignore
    amq.maxConnectionErrors = 0;
    const reconnectMock = jest.spyOn(amq as any, 'reconnect');
    const errorMock = jest.spyOn(console, 'error');
    // @ts-ignore
    await amq.handleConnectionError(new Error('connection error'));
    expect(reconnectMock).toBeCalledTimes(1);
    expect(errorMock).toBeCalledTimes(1);

    reconnectMock.mockClear();
    errorMock.mockClear();
  });

  it('"handleConnectionError" should log warning and trigger reconnect', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();
    // @ts-ignore
    amq.maxConnectionErrors = 10;
    const reconnectMock = jest.spyOn(amq as any, 'reconnect');
    const warnMock = jest.spyOn(console, 'warn');
    // @ts-ignore
    await amq.handleConnectionError(new Error('connection error'));
    expect(reconnectMock).toBeCalledTimes(1);
    expect(warnMock).toBeCalledTimes(1);

    reconnectMock.mockClear();
    warnMock.mockClear();
  });

  it('"handleConnectionClose" should trigger reconnect', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();
    const reconnectMock = jest.spyOn(amq as any, 'reconnect');
    // @ts-ignore
    await amq.handleConnectionClose();
    expect(reconnectMock).toBeCalledTimes(1);

    reconnectMock.mockClear();
  });

  it('"init" should connect and create a channel', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    const connectMock = jest.spyOn(amq as any, 'connect');
    const createChannelMock = jest.spyOn(amq as any, 'createChannel');

    await amq.init();
    expect(connectMock).toBeCalledTimes(1);
    expect(createChannelMock).toBeCalledTimes(1);

    connectMock.mockClear();
    createChannelMock.mockClear();
  });

  it('"reconnect" should connect and create a channel', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    const initMock = jest.spyOn(amq, 'init').mockImplementation(() => {
      throw new Error('init error');
    });
    const waitAndReconnectMock = jest
      .spyOn(amq as any, 'waitAndReconnect')
      .mockImplementation(() => {});

    //@ts-ignore
    await amq.reconnect();
    expect(waitAndReconnectMock).toBeCalledTimes(1);

    waitAndReconnectMock.mockClear();
    initMock.mockClear();
  });

  it('"waitAndReconnect" should connect and create a channel', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    const reconnectMock = jest
      .spyOn(amq as any, 'reconnect')
      .mockImplementation(() => {});

    //@ts-ignore
    await amq.waitAndReconnect();

    expect(reconnectMock).toBeCalledTimes(1);
    expect(waitMock).toBeCalledTimes(1);

    reconnectMock.mockClear();
    waitMock.mockClear();
  });

  it('"reassignHandlers" should connect and create a channel', async () => {
    const handlers = [() => {}, () => {}];
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();

    const consumeMock = jest
      .spyOn((amq as any).channel, 'consume')
      .mockImplementation(() => {});

    //@ts-ignore
    amq.handlers.set('queue', handlers);

    //@ts-ignore
    await amq.reassignHandlers();

    expect(consumeMock).toBeCalledTimes(handlers.length);

    consumeMock.mockClear();
  });

  it('"send" should trigger channel.sendToQueue', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();
    const sendToQueueMock = jest.spyOn((amq as any).channel, 'sendToQueue');
    amq.send('MessageQueue.Action', Buffer.from(''));
    expect(sendToQueueMock).toHaveBeenCalled();
    sendToQueueMock.mockClear();
  });

  it('"ack" should trigger channel.ack', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();
    const ackMock = jest.spyOn((amq as any).channel, 'ack');
    amq.ack({ toDto: () => ({}) } as any);
    expect(ackMock).toHaveBeenCalled();

    ackMock.mockClear();
  });

  it('"ack" should trigger channel.ack', async () => {
    const errorMock = jest.spyOn(console, 'error');
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();

    amq.ack(null);
    expect(errorMock).toBeCalled();

    errorMock.mockClear();
  });

  it('"reject" should trigger channel.reject', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();
    const rejectMock = jest.spyOn((amq as any).channel, 'reject');
    amq.reject({ toDto: () => ({}) } as any);
    expect(rejectMock).toHaveBeenCalled();

    rejectMock.mockClear();
  });

  it('"reject" should trigger channel.reject', async () => {
    const errorMock = jest.spyOn(console, 'error');
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();

    amq.reject(null);
    errorMock.mockClear();
  });

  it('"consume" should log an error when adding a message handler has failed', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();

    const consumeMock = jest
      .spyOn((amq as any).channel, 'consume')
      .mockImplementation(() => {
        throw new Error();
      });
    const errorMock = jest.spyOn(console, 'error');

    amq.consume('MessageQueue.Action', () => {});
    expect(errorMock).toBeCalled();

    consumeMock.mockClear();
    errorMock.mockClear();
  });

  it('"consume" should add message handler to the list assigned to the queue and consume that message', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();

    //@ts-ignore
    amq.handlers.set('MessageQueue.Action', []);

    const consumeMock = jest
      .spyOn((amq as any).channel, 'consume')
      .mockImplementation(() => {});
    const errorMock = jest.spyOn(console, 'error');

    amq.consume('MessageQueue.Action', () => {});

    expect(consumeMock).toBeCalled();

    consumeMock.mockClear();
    errorMock.mockClear();
  });
});
