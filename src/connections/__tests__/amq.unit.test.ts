/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Amq, QueueName } from '../amq';
import amqp from 'amqplib';

let channelMock;
let connectionMock;
let connectSpy;

describe('Amq instance Unit tests', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    channelMock = {
      assertQueue: jest.fn(),
      prefetch: jest.fn(),
      consume: jest.fn(),
      sendToQueue: jest.fn(),
      ack: jest.fn(),
      reject: jest.fn(),
    };
    connectionMock = {
      createConfirmChannel: jest.fn().mockResolvedValueOnce(channelMock),
      on: jest.fn(),
    };
  });

  it('Should contain "connection_string" equal to the value given in the constructor', async () => {
    const connectionString = 'some_connection_string';
    const amq = new Amq(connectionString, console);
    // @ts-ignore
    expect(amq.address).toEqual(connectionString);
  });

  it('"connect" should connect and add "error" and connection "close" handlers', async () => {
    connectSpy = jest
      .spyOn(amqp as any, 'connect')
      .mockResolvedValueOnce(connectionMock);
    const connectionString = 'some_connection_string';
    const amq = new Amq(connectionString, console);

    await amq.init();
    const events = connectionMock.on.mock.calls.map(call => call[0]);

    expect(connectSpy).toBeCalledWith(connectionString);
    expect(connectionMock.on).toHaveBeenCalledTimes(2);
    expect(events).toEqual(expect.arrayContaining(['error', 'close']));
  });

  it('"createChannel" should create channel correctly and assert queues "action", "aw_block_range", "recalc_asset"', async () => {
    connectSpy = jest
      .spyOn(amqp as any, 'connect')
      .mockResolvedValueOnce(connectionMock);
    const connectionString = 'some_connection_string';
    const amq = new Amq(connectionString, console);
    await amq.init();

    expect(connectionMock.createConfirmChannel).toBeCalledTimes(1);
    expect(channelMock.assertQueue).toBeCalledWith(QueueName.Action, {
      durable: true,
    });
    expect(channelMock.assertQueue).toBeCalledWith(
      QueueName.AlienWorldsBlockRange,
      { durable: true }
    );
    expect(channelMock.assertQueue).toBeCalledWith(QueueName.RecalcAsset, {
      durable: true,
    });
  });

  it('"handleConnectionError" should call Amqp.connect', async () => {
    connectSpy = jest
      .spyOn(amqp as any, 'connect')
      .mockResolvedValueOnce(connectionMock);
    const amq = new Amq('', console);
    // @ts-ignore
    await amq.handleConnectionError(new Error('connection error'));
    expect(connectSpy).toHaveBeenCalled();
  });

  it('"handleConnectionClose" should call Amqp.connect', async () => {
    connectSpy = jest
      .spyOn(amqp as any, 'connect')
      .mockResolvedValueOnce(connectionMock);
    const amq = new Amq('', console);
    // @ts-ignore
    await amq.handleConnectionClose();
    expect(connectSpy).toHaveBeenCalled();
  });

  it('"handleConnectionError" should trigger channel.consume on stored handlers', async () => {
    const amq = new Amq('', console);
    connectSpy = jest
      .spyOn(amqp as any, 'connect')
      .mockResolvedValueOnce(connectionMock);
    // @ts-ignore
    amq.handlers.set('action', () => true);
    // @ts-ignore
    amq.handlers.set('other_action', () => true);
    // @ts-ignore
    await amq.handleConnectionError(new Error('connection error'));
    expect(channelMock.consume).toBeCalledTimes(2);
  });

  it('"addListener" should display an error when connection attempts exceeded the limit', async () => {
    connectSpy = jest
      .spyOn(amqp as any, 'connect')
      .mockResolvedValueOnce(connectionMock);
    const errorSpy = jest.spyOn(console, 'error');
    const amq = new Amq('', console);
    // @ts-ignore
    amq.connectionErrorsCount = 10;
    // @ts-ignore
    amq.maxConnectionErrors = 5;
    // @ts-ignore
    await amq.handleConnectionError(new Error('connection error'));

    expect(errorSpy).toHaveBeenCalled();
  });

  it('"handleConnectionClose" should trigger channel.consume on stored handlers', async () => {
    const amq = new Amq('', console);
    connectSpy = jest
      .spyOn(amqp as any, 'connect')
      .mockResolvedValueOnce(connectionMock);
    // @ts-ignore
    amq.handlers.set('action', () => true);
    // @ts-ignore
    amq.handlers.set('other_action', () => true);
    // @ts-ignore
    await amq.handleConnectionClose();
    expect(channelMock.consume).toBeCalledTimes(2);
  });

  it('"send" should trigger channel.sendToQueue', async () => {
    connectSpy = jest
      .spyOn(amqp as any, 'connect')
      .mockResolvedValueOnce(connectionMock);
    const amq = new Amq('', console);

    await amq.init();
    amq.send('action', Buffer.from(''));
    expect(channelMock.sendToQueue).toHaveBeenCalled();
  });

  it('"ack" should trigger channel.ack', async () => {
    connectSpy = jest
      .spyOn(amqp as any, 'connect')
      .mockResolvedValueOnce(connectionMock);
    const amq = new Amq('', console);

    await amq.init();
    amq.ack(null);
    expect(channelMock.ack).toHaveBeenCalled();
  });

  it('"reject" should trigger channel.reject', async () => {
    connectSpy = jest
      .spyOn(amqp as any, 'connect')
      .mockResolvedValueOnce(connectionMock);
    const amq = new Amq('', console);

    await amq.init();
    amq.reject({
      content: Buffer.from(''),
      fields: null,
      properties: null,
    });
    expect(channelMock.reject).toHaveBeenCalled();
  });

  it('"addListener" should trigger channel.consume', async () => {
    connectSpy = jest
      .spyOn(amqp as any, 'connect')
      .mockResolvedValueOnce(connectionMock);
    const amq = new Amq('', console);

    await amq.init();
    amq.addListener('action', () => true);
    expect(channelMock.consume).toHaveBeenCalled();
  });

  it('"addListener" should add given handler to the map', async () => {
    connectSpy = jest
      .spyOn(amqp as any, 'connect')
      .mockResolvedValueOnce(connectionMock);
    const amq = new Amq('', console);

    await amq.init();
    amq.addListener('action', () => true);
    // @ts-ignore
    expect(amq.handlers.has('action')).toEqual(true);
  });

  it('"addListener" should display a warning about the handler being replaced.', async () => {
    connectSpy = jest
      .spyOn(amqp as any, 'connect')
      .mockResolvedValueOnce(connectionMock);
    const warnSpy = jest.spyOn(console, 'warn');
    const amq = new Amq('', console);

    await amq.init();
    amq.addListener('action', () => true);
    amq.addListener('action', () => true);

    expect(warnSpy).toHaveBeenCalled();
  });
});
