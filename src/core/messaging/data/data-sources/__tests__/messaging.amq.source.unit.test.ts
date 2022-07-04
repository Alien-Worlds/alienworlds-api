/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'reflect-metadata';

import { connect } from 'amqplib';
import { MessagingAmqSource } from '../messaging.amq.source';
import { wait } from '../../messaging.utils';
import { ConnectionState } from '@core/messaging/domain/messaging.enums';

jest.mock('../../messaging.utils', () => ({
  wait: jest.fn(),
}));

jest.mock('amqplib', () => ({
  connect: jest.fn(() => ({
    on: jest.fn(() => {}),
    createChannel: jest.fn(() => ({
      prefetch: jest.fn(),
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
      consume: jest.fn(),
      ack: jest.fn(),
      reject: jest.fn(),
      on: jest.fn(),
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

  it('"connect" should not open new connection when status is other than "Offline"', async () => {
    const connectionString = 'some_connection_string';
    const amq = new MessagingAmqSource(
      connectionString,
      { queues: [], prefetch: 1 },
      console
    );
    // @ts-ignore
    amq.connectionState = ConnectionState.Online;
    // @ts-ignore
    amq.connect();
    expect(connectMock).not.toBeCalledWith(connectionString);
  });

  it('"createChannel" should create channel correctly and assert queues "action", "aw_block_range", "recalc_asset"', async () => {
    const connectionString = 'some_connection_string';
    const amq = new MessagingAmqSource(
      connectionString,
      {
        queues: [
          {
            name: 'MessageQueue.Action',
            options: {
              durable: true,
            },
          },
          {
            name: 'MessageQueue.AlienWorldsBlockRange',
            options: {
              durable: true,
            },
          },
          {
            name: 'MessageQueue.RecalcAsset',
            options: {
              durable: true,
            },
          },
        ],
        prefetch: 1,
      },
      console
    );
    await amq.init();
    const createChannelMock = jest.spyOn(
      (amq as any).connection,
      'createChannel'
    );
    const prefetchMock = jest.spyOn((amq as any).channel, 'prefetch');
    const assertQueueMock = jest.spyOn((amq as any).channel, 'assertQueue');

    expect(createChannelMock).toBeCalledTimes(1);
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

    createChannelMock.mockClear();
    prefetchMock.mockClear();
    assertQueueMock.mockClear();
  });

  it('"handleConnectionClose" should call Amqp.connect when connectionState is "closing"', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    const reconnectMock = jest.spyOn(amq as any, 'reconnect');
    // @ts-ignore
    amq.connectionState = ConnectionState.Closing;
    // @ts-ignore
    await amq.handleConnectionClose();
    expect(connectMock).toHaveBeenCalled();
    expect(reconnectMock).toBeCalledTimes(1);

    reconnectMock.mockClear();
  });

  it('"handleConnectionClose" should....', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    const reconnectMock = jest
      .spyOn(amq as any, 'reconnect')
      .mockImplementation();
    const handler = jest.fn();
    // @ts-ignore
    amq.connectionState = ConnectionState.Closing;
    // @ts-ignore
    amq.connectionStateHandlers.set(ConnectionState.Offline, handler);
    // @ts-ignore
    await amq.handleConnectionClose();
    expect(handler).toHaveBeenCalled();

    reconnectMock.mockClear();
  });

  it('"handleConnectionError" should log warning', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();
    // @ts-ignore
    amq.maxConnectionErrors = 10;
    const warnMock = jest.spyOn(console, 'warn');
    // @ts-ignore
    await amq.handleConnectionError(new Error('connection error'));
    expect(warnMock).toBeCalledTimes(1);

    warnMock.mockClear();
  });

  it('"handleConnectionError" should log error', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    await amq.init();
    // @ts-ignore
    amq.maxConnectionErrors = 0;
    const errorMock = jest.spyOn(console, 'error');
    // @ts-ignore
    await amq.handleConnectionError(new Error('connection error'));
    expect(errorMock).toBeCalledTimes(1);

    errorMock.mockClear();
  });

  it('Should close the connection when its status is "online"', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    const connection = { close: jest.fn() };
    // @ts-ignore
    amq.connectionState = ConnectionState.Online;
    // @ts-ignore
    amq.connection = connection;

    const closeMock = jest.spyOn(connection, 'close');

    // @ts-ignore
    amq.close(new Error('Some error'));

    expect(closeMock).toBeCalledTimes(1);
    expect((amq as any).connectionState).toEqual(ConnectionState.Closing);
    expect((amq as any).connectionError.message).toEqual('Some error');

    closeMock.mockClear();
  });

  it('Should call connection.close on error, cancellation, or closing the channel', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );
    // @ts-ignore
    amq.connectionState = ConnectionState.Online;
    // @ts-ignore
    amq.maxConnectionErrors = 0;
    const closeMock = jest.spyOn(amq, 'close').mockImplementation();
    // @ts-ignore
    amq.handleChannelCancel();
    // @ts-ignore
    amq.handleChannelClose();
    // @ts-ignore
    amq.handleChannelError(new Error('Some error'));

    expect(closeMock).toBeCalledTimes(3);

    closeMock.mockClear();
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

  it('"getQueueStats" should return queue stats if queue was found', async () => {
    const amq = new MessagingAmqSource(
      '',
      {
        queues: [
          {
            name: 'foo',
            options: {},
          },
        ],
        prefetch: 1,
      },
      console
    );
    const channel = { assertQueue: jest.fn() };

    const assertQueueMock = jest
      .spyOn(channel, 'assertQueue')
      .mockImplementation(() => {});

    //@ts-ignore
    amq.channel = channel;

    await amq.getQueueStats('foo');

    expect(assertQueueMock).toBeCalledTimes(1);

    assertQueueMock.mockClear();
  });

  it('"getQueueStats" should throw an error when queue was not found', async () => {
    const amq = new MessagingAmqSource(
      '',
      {
        queues: [
          {
            name: 'foo',
            options: {},
          },
        ],
        prefetch: 1,
      },
      console
    );
    const channel = { assertQueue: jest.fn() };
    const assertQueueMock = jest
      .spyOn(channel, 'assertQueue')
      .mockImplementation(() => {});

    //@ts-ignore
    amq.channel = channel;

    let getQueueStatsError;

    await amq.getQueueStats('bar').catch(error => (getQueueStatsError = error));

    expect(getQueueStatsError).toBeInstanceOf(Error);

    assertQueueMock.mockClear();
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
    await amq
      .send('MessageQueue.Action', Buffer.from(''))
      .catch(e => console.log(e));
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

  it('"addConnectionStateHandler" should log warning when handler is already assigned to the connection state', async () => {
    const warnMock = jest.spyOn(console, 'warn');
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );

    amq.addConnectionStateHandler(ConnectionState.Online, async () => {});
    amq.addConnectionStateHandler(ConnectionState.Online, async () => {});

    expect(warnMock).toBeCalled();
    warnMock.mockClear();
  });

  it('"addConnectionStateHandler" should assign handler to the connection state', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );

    amq.addConnectionStateHandler(ConnectionState.Online, async () => {});
    expect(
      (amq as any).connectionStateHandlers.has(ConnectionState.Online)
    ).toBeTruthy();
  });

  it('"removeConnectionStateHandlers" should remove handler assigned to the state', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );

    amq.addConnectionStateHandler(ConnectionState.Online, async () => {});
    amq.removeConnectionStateHandlers(ConnectionState.Online);

    expect(
      (amq as any).connectionStateHandlers.has(ConnectionState.Online)
    ).toBeFalsy();
  });

  it('"removeConnectionStateHandlers" should remove all handlers', async () => {
    const amq = new MessagingAmqSource(
      '',
      { queues: [], prefetch: 1 },
      console
    );

    amq.removeConnectionStateHandlers();
    expect((amq as any).connectionStateHandlers.size).toEqual(0);
  });
});
