/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { WaxConnectionState } from '@common/state-history/domain/state-history.enums';
import { WaxSource } from '../wax.source';

const webSocketMock = {
  on: jest.fn(),
  once: jest.fn((type, callback) => {
    callback(true);
  }),
  close: jest.fn(),
  send: jest.fn(),
  removeAllListeners: jest.fn(),
};

jest.mock('ws', () => jest.fn().mockImplementation(() => webSocketMock));

describe('WAX source Unit tests', () => {
  it('"updateConnectionState" should return a handler assigned to the connection state', () => {
    const source = new WaxSource({} as any);
    const handler = jest.fn();
    source.addConnectionStateHandler(WaxConnectionState.Connected, handler);

    (source as any).updateConnectionState(WaxConnectionState.Connected);

    expect(handler).toBeCalled();
  });

  it('"getNextEndpoint" should return first endpoint form the list', () => {
    const source = new WaxSource({ shipEndpoints: ['foo', 'bar'] } as any);
    const endpoint = (source as any).getNextEndpoint();

    expect(endpoint).toEqual('foo');
  });

  it('"getNextEndpoint" should return last endpoint form the list', () => {
    const shipEndpoints = ['foo', 'bar'];
    const source = new WaxSource({ shipEndpoints } as any);
    let endpoint;

    for (let i = 0; i < shipEndpoints.length; i++) {
      endpoint = (source as any).getNextEndpoint();
    }

    expect(endpoint).toEqual('bar');
  });

  it('"getNextEndpoint" should return first endpoint form the list when it went through the entire list', () => {
    const source = new WaxSource({ shipEndpoints: ['foo', 'bar'] } as any);
    (source as any).getNextEndpoint();
    (source as any).getNextEndpoint();
    const endpoint = (source as any).getNextEndpoint();

    expect(endpoint).toEqual('foo');
  });

  it('"onError" should set error handler', () => {
    const source = new WaxSource({} as any);
    source.onError(jest.fn());

    expect((source as any).errorHandler).toBeTruthy();
  });

  it('"onMessage" should set message handler', () => {
    const source = new WaxSource({} as any);
    source.onMessage(jest.fn());

    expect((source as any).messageHandler).toBeTruthy();
  });

  it('"addConnectionStateHandler" should log warning if there is already a handler assigned to the state', () => {
    const source = new WaxSource({} as any);
    const warnMock = jest.spyOn(console, 'warn');

    source.addConnectionStateHandler(WaxConnectionState.Connected, jest.fn());
    source.addConnectionStateHandler(WaxConnectionState.Connected, jest.fn());

    expect(warnMock).toBeCalled();

    warnMock.mockClear();
  });

  it('"addConnectionStateHandler" should assign a handler to the state', () => {
    const source = new WaxSource({} as any);

    source.addConnectionStateHandler(WaxConnectionState.Connected, jest.fn());

    expect(
      (source as any).connectionChangeHandlers.has(WaxConnectionState.Connected)
    ).toBeTruthy();
  });

  it('"isConnected" should return true if source is connected', () => {
    const source = new WaxSource({} as any);
    (source as any).connectionState = WaxConnectionState.Connected;

    expect(source.isConnected).toBeTruthy();
  });

  it('"isConnected" should return false if source is not connected', () => {
    const source = new WaxSource({} as any);
    (source as any).connectionState = WaxConnectionState.Idle;

    expect(source.isConnected).toBeFalsy();
  });

  it('"connect" should change connection status to "connecting" and then after successful connection to "connected"', async () => {
    const source = new WaxSource({} as any);
    const updateConnectionStateMock = jest.fn();

    (source as any).errorHandler = jest.fn();
    (source as any).getNextEndpoint = jest.fn();
    (source as any).updateConnectionState = updateConnectionStateMock;
    (source as any).waitUntilConnectionIsOpen = jest.fn();
    (source as any).receiveAbi = jest.fn().mockResolvedValue('');

    await source.connect();

    expect(updateConnectionStateMock).toBeCalledTimes(2);
  });

  it('"connect" should call error handler on any error', async () => {
    const source = new WaxSource({} as any);

    (source as any).errorHandler = jest.fn();
    (source as any).getNextEndpoint = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    await source.connect();

    expect((source as any).errorHandler).toBeCalled();
  });

  it('"connect" should wait until connection is open and receive first message as ABI', async () => {
    const source = new WaxSource({} as any);
    const updateConnectionStateMock = jest.fn();

    (source as any).errorHandler = jest.fn();
    (source as any).getNextEndpoint = jest.fn();
    (source as any).updateConnectionState = updateConnectionStateMock;
    (source as any).waitUntilConnectionIsOpen = jest.fn();
    (source as any).receiveAbi = jest.fn().mockResolvedValue('');

    await source.connect();

    expect((source as any).waitUntilConnectionIsOpen).toBeCalled();
    expect((source as any).receiveAbi).toBeCalled();
  });

  it('"disconnect" should change connection status to "disconnecting" and then after successful disconnection to "idle"', async () => {
    const source = new WaxSource({} as any);
    const updateConnectionStateMock = jest.fn();

    (source as any).connectionState = WaxConnectionState.Connected;
    (source as any).client = webSocketMock;
    (source as any).errorHandler = jest.fn();
    (source as any).updateConnectionState = updateConnectionStateMock;
    (source as any).waitUntilConnectionIsClosed = jest.fn();

    await source.disconnect();

    expect(webSocketMock.close).toBeCalled();
    expect((source as any).client).toBeNull();
    expect(updateConnectionStateMock).toBeCalledTimes(2);
  });

  it('"disconnect" should call error handler on any error', async () => {
    const source = new WaxSource({} as any);

    (source as any).connectionState = WaxConnectionState.Connected;
    (source as any).errorHandler = jest.fn();
    (source as any).client = webSocketMock;
    (source as any).client.close.mockImplementation(() => {
      throw new Error();
    });

    await source.disconnect();

    expect((source as any).errorHandler).toBeCalled();
  });

  it('"send" should call client.send', async () => {
    const source = new WaxSource({} as any);
    (source as any).client = webSocketMock;

    await source.send(new Uint8Array());

    expect((source as any).client.send).toBeCalled();
  });

  it('"waitUntilConnectionIsOpen" should resolve a promise on "open" handler', async () => {
    const source = new WaxSource({} as any);
    (source as any).client = webSocketMock;

    const result = await (source as any).waitUntilConnectionIsOpen();

    expect(result).toBeTruthy();
  });
  it('"waitUntilConnectionIsClosed" should resolve a promise on "close" handler', async () => {
    const source = new WaxSource({} as any);
    (source as any).client = webSocketMock;

    const result = await (source as any).waitUntilConnectionIsClosed();

    expect(result).toBeTruthy();
  });
  it('"receiveAbi" should resolve a promise once on "message" handler', async () => {
    const source = new WaxSource({} as any);
    (source as any).client = webSocketMock;

    const result = await (source as any).receiveAbi();

    expect(result).toBeTruthy();
  });
});
