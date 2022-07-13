/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AbiRepositoryImpl } from '@common/abi/data/repositories/abi.repository-impl';
import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { GetBlocksRequest } from '@common/state-history/domain/entities/get-blocks.request';
import { StateHistoryMessage } from '@common/state-history/domain/entities/state-history.message';
import { MissingHandlersError } from '@common/state-history/domain/errors/missing-handlers.error';
import { ServiceAlreadyConnectedError } from '@common/state-history/domain/errors/service-already-connected.error';
import { ServiceNotConnectedError } from '@common/state-history/domain/errors/service-not-connected.error';
import { UnhandledBlockRequestError } from '@common/state-history/domain/errors/unhandled-block-request.error';
import { WaxConnectionState } from '@common/state-history/domain/state-history.enums';
import { Failure } from '@core/architecture/domain/failure';
import { StateHistorySource } from '../data-sources/state-history.source';
import { StateHistoryServiceImpl } from '../state-history.service-impl';

jest.mock(
  '@common/abi/data/repositories/abi.repository-impl',
  jest.fn(() => ({}))
);

jest.mock(
  '../data-sources/state-history.source',
  jest.fn(() => ({
    onMessage: jest.fn(),
    onError: jest.fn(),
    addConnectionStateHandler: jest.fn(),
  }))
);

jest.mock(
  '@common/abi/data/repositories/abi.repository-impl',
  jest.fn(() => ({
    createAbi: jest.fn(),
    getCurrentAbi: jest.fn(),
    clearCurrentAbi: jest.fn(),
  }))
);

jest.mock(
  '@common/state-history/domain/state-history.utils',
  jest.fn(() => ({
    serializeMessage: jest.fn(),
    log: jest.fn(),
  }))
);

const abiRepository = {
  createAbi: jest.fn(),
  getCurrentAbi: jest.fn(),
  clearCurrentAbi: jest.fn(),
} as any;

const stateHistorySource = {
  onMessage: jest.fn(),
  onError: jest.fn(),
  addConnectionStateHandler: jest.fn(),
} as any;

const abiRepositoryMock = abiRepository as jest.MockedObject<AbiRepositoryImpl>;
const stateHistorySourceMock =
  stateHistorySource as jest.MockedObject<StateHistorySource>;

describe('State History Service Implementation Unit tests', () => {
  it('Should initialize source listeners', () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );

    expect(stateHistorySourceMock.onMessage).toBeCalled();
    expect(stateHistorySourceMock.onError).toBeCalled();
    expect(
      JSON.stringify(
        stateHistorySourceMock.addConnectionStateHandler.mock.calls
      )
    ).toEqual(
      JSON.stringify([
        [WaxConnectionState.Connected, () => {}],
        [WaxConnectionState.Idle, () => {}],
      ])
    );
  });

  it('"onConnected" should call repository createAbi', () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    abiRepositoryMock.createAbi.mockReturnValue({
      isFailure: false,
    } as any);

    service.onConnected({ data: JSON.stringify({ version: '1.0' }) } as any);

    expect(abiRepositoryMock.createAbi).toBeCalled();
  });

  it('"onConnected" should throw an error', () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );

    abiRepositoryMock.createAbi.mockImplementation(() => {
      throw new Error('ABI_ERROR');
    });

    try {
      service.onConnected({ data: JSON.stringify({ version: '1.0' }) } as any);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toEqual('ABI_ERROR');
    }
  });

  it('"onDisconnected" should call repository clearCurrentAbi', () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    abiRepositoryMock.clearCurrentAbi.mockReturnValue({
      isFailure: false,
    } as any);

    service.onDisconnected({
      previousState: WaxConnectionState.Disconnecting,
    } as any);

    expect(abiRepositoryMock.clearCurrentAbi).toBeCalled();
  });

  it('"onDisconnected" should throw an error', () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );

    abiRepositoryMock.clearCurrentAbi.mockImplementation(() => {
      throw new Error('ABI_ERROR');
    });

    try {
      service.onDisconnected({
        previousState: WaxConnectionState.Disconnecting,
      } as any);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toEqual('ABI_ERROR');
    }
  });

  it('"onMessage" should call handleError() when getCurrentAbi fails', () => {
    const error = new Error('SOME_ERROR');
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    const handleErrorMock = jest
      .spyOn(service as any, 'handleError')
      .mockImplementation();

    abiRepositoryMock.getCurrentAbi.mockReturnValue({
      isFailure: true,
      failure: {
        error,
      },
    } as any);

    service.onMessage(Uint8Array.from([]));
    expect(handleErrorMock).toBeCalled();
  });

  it('"onMessage" should run error handler when message is unknown type', () => {
    const error = new Error('SOME_ERROR');
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    const createStaticMock = jest.fn().mockReturnValue({
      content: {},
      type: 'SOME_TYPE',
    });
    const handleErrorMock = jest
      .spyOn(service as any, 'handleError')
      .mockImplementation();
    StateHistoryMessage.create = createStaticMock;

    abiRepositoryMock.getCurrentAbi.mockReturnValue({
      isFailure: false,
      content: {
        getTypesMap: () => new Map(),
      },
    } as any);

    service.onMessage(Uint8Array.from([]));
    expect(handleErrorMock).toBeCalled();

    handleErrorMock.mockClear();
  });

  it('"onMessage" should call handleBlocksResultContent when message is "get_blocks_result_{version}" type', () => {
    const error = new Error('SOME_ERROR');
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    const createStaticMock = jest.fn().mockReturnValue({
      content: {},
      isGetBlocksResult: true,
      type: 'SOME_TYPE',
    });
    const handleBlocksResultContentMock = jest
      .spyOn(service as any, 'handleBlocksResultContent')
      .mockImplementation();
    StateHistoryMessage.create = createStaticMock;

    abiRepositoryMock.getCurrentAbi.mockReturnValue({
      isFailure: false,
      content: {
        getTypesMap: () => new Map(),
      },
    } as any);

    service.onMessage(Uint8Array.from([]));
    expect(handleBlocksResultContentMock).toBeCalled();

    handleBlocksResultContentMock.mockClear();
  });

  it('"handleBlocksResultContent" should call handleError when "getCurrentAbi" fails', () => {
    const error = new Error('SOME_ERROR');
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    const handleErrorMock = jest
      .spyOn(service as any, 'handleError')
      .mockImplementation();

    const result = {};
    (service as any).blockRangeRequest = { blockRange: { start: 0n, end: 1n } };

    abiRepositoryMock.getCurrentAbi.mockReturnValue({
      isFailure: true,
      failure: {
        error,
      },
    } as any);

    (service as any).handleBlocksResultContent(result);
    expect(handleErrorMock).toBeCalled();

    handleErrorMock.mockClear();
  });

  it('"handleBlocksResultContent" should return a failure when "getCurrentAbi" fails', () => {
    const error = new Error('SOME_ERROR');
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    const handleWarningMock = jest
      .spyOn(service as any, 'handleWarning')
      .mockImplementation();
    const result = {};
    (service as any).blockRangeRequest = { blockRange: { start: 0n, end: 1n } };

    abiRepositoryMock.getCurrentAbi.mockReturnValue({
      isFailure: false,
      content: {},
    } as any);

    (service as any).handleBlocksResultContent(result);
    expect(handleWarningMock).toBeCalled();

    handleWarningMock.mockClear();
  });

  it('"handleBlocksResultContent" should call block handler when getBlocks result contains "thisBlock"', async () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    service.onReceivedBlock(jest.fn());
    service.onBlockRangeComplete(jest.fn());
    (service as any).blockRangeRequest = { blockRange: { start: 0n, end: 1n } };

    const receivedBlockHandlerMock = jest
      .spyOn(service as any, 'receivedBlockHandler')
      .mockImplementation();
    const blockRangeCompleteHandlerMock = jest
      .spyOn(service as any, 'blockRangeCompleteHandler')
      .mockImplementation();
    const result = { thisBlock: { blockNumber: 10n } };

    abiRepositoryMock.getCurrentAbi.mockReturnValue({
      isFailure: false,
      content: {},
    } as any);

    await (service as any).handleBlocksResultContent(result);

    expect(receivedBlockHandlerMock).toBeCalled();
    expect(blockRangeCompleteHandlerMock).not.toBeCalled();

    receivedBlockHandlerMock.mockClear();
    blockRangeCompleteHandlerMock.mockClear();
  });

  it('"handleBlocksResultContent" should call complete handler when thisBlock.blockNumber equals the last block in the range - 1', async () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    service.onReceivedBlock(jest.fn());
    service.onBlockRangeComplete(jest.fn());

    const receivedBlockHandlerMock = jest
      .spyOn(service as any, 'receivedBlockHandler')
      .mockImplementation();
    const blockRangeCompleteHandlerMock = jest
      .spyOn(service as any, 'blockRangeCompleteHandler')
      .mockImplementation();
    const result = { thisBlock: { blockNumber: 1n } };
    (service as any).blockRangeRequest = { blockRange: { start: 0n, end: 2n } };

    abiRepositoryMock.getCurrentAbi.mockReturnValue({
      isFailure: false,
      content: {},
    } as any);

    await (service as any).handleBlocksResultContent(result);

    expect((service as any).blockRangeRequest).toBeNull();
    expect(blockRangeCompleteHandlerMock).toBeCalled();

    receivedBlockHandlerMock.mockClear();
    blockRangeCompleteHandlerMock.mockClear();
  });

  it('"handleBlocksResultContent" should send ack message when service is connected', async () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    service.onReceivedBlock(jest.fn());
    service.onBlockRangeComplete(jest.fn());

    const receivedBlockHandlerMock = jest
      .spyOn(service as any, 'receivedBlockHandler')
      .mockImplementation();
    const blockRangeCompleteHandlerMock = jest
      .spyOn(service as any, 'blockRangeCompleteHandler')
      .mockImplementation();
    const result = { thisBlock: { blockNumber: 1n } };
    (service as any).blockRangeRequest = { blockRange: { start: 0n, end: 2n } };
    (service as any).source = { isConnected: true, send: jest.fn() };

    abiRepositoryMock.getCurrentAbi.mockReturnValue({
      isFailure: false,
      content: { getTypesMap: () => new Map() },
    } as any);

    await (service as any).handleBlocksResultContent(result);

    expect((service as any).source.send).toBeCalled();

    receivedBlockHandlerMock.mockClear();
    blockRangeCompleteHandlerMock.mockClear();
    (service as any).source.send.mockClear();
  });

  it('"handleError" should call error handler if it is set', () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    (service as any).errorHandler = jest.fn();

    (service as any).handleError(new Error());

    expect((service as any).errorHandler).toBeCalled();
  });

  it('"handleWarning" should call warning handler if it is set', () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    (service as any).warningHandler = jest.fn();

    (service as any).handleWarning('WARNING');

    expect((service as any).warningHandler).toBeCalled();
  });

  it('"connect" should fail with MissingHandlersError when listeners are not set', async () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );

    const result = await service.connect();

    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
    expect(result.failure.error).toBeInstanceOf(MissingHandlersError);
  });

  it('"connect" should call source.connect and result without any content', async () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    (service as any).source = {
      isConnected: false,
      connect: jest.fn(),
    };
    (service as any).receivedBlockHandler = jest.fn();
    (service as any).blockRangeCompleteHandler = jest.fn();

    const result = await service.connect();

    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();
  });

  it('"connect" should fail with ServiceAlreadyConnectedError when service was already connected', async () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    (service as any).source = {
      isConnected: true,
      connect: jest.fn(),
    };
    (service as any).receivedBlockHandler = jest.fn();
    (service as any).blockRangeCompleteHandler = jest.fn();

    const result = await service.connect();

    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
    expect(result.failure.error).toBeInstanceOf(ServiceAlreadyConnectedError);
  });

  it('"disconnect" should call source.disconnect and result without any content', async () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    (service as any).source = {
      isConnected: true,
      disconnect: jest.fn(),
    };

    const result = await service.disconnect();

    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();
  });

  it('"disconnect" should fail with ServiceNotConnectedError when service is not connected', async () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    (service as any).source = {
      isConnected: false,
      disconnect: jest.fn(),
    };

    const result = await service.disconnect();

    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
    expect(result.failure.error).toBeInstanceOf(ServiceNotConnectedError);
  });

  it('"onReceivedBlock" should set handler', async () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    service.onReceivedBlock(jest.fn());

    expect((service as any).receivedBlockHandler).toBeTruthy();
  });

  it('"onBlockRangeComplete" should set handler', async () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    service.onBlockRangeComplete(jest.fn());

    expect((service as any).blockRangeCompleteHandler).toBeTruthy();
  });

  it('"onError" should set handler', async () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    service.onError(jest.fn());

    expect((service as any).errorHandler).toBeTruthy();
  });

  it('"onWarning" should set handler', async () => {
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    service.onWarning(jest.fn());

    expect((service as any).warningHandler).toBeTruthy();
  });

  it('"requestBlocks" should fail if provious request was not finished', async () => {
    const error = new Error('SOME_ERROR');
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    (service as any).blockRangeRequest = {};

    const result = await service.requestBlocks(BlockRange.create(0, 1), {
      shouldFetchDeltas: true,
      shouldFetchTraces: true,
    });
    expect(result.failure).toBeInstanceOf(Failure);
    expect(result.failure.error).toBeInstanceOf(UnhandledBlockRequestError);
  });

  it('"requestBlocks" should return a failure when getCurrentAbi fails', async () => {
    const error = new Error('SOME_ERROR');
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );

    abiRepositoryMock.getCurrentAbi.mockReturnValue({
      isFailure: true,
      failure: Failure.fromError(error),
    } as any);

    const result = await service.requestBlocks(BlockRange.create(0, 1), {
      shouldFetchDeltas: true,
      shouldFetchTraces: true,
    });

    expect(result.failure).toBeInstanceOf(Failure);
    expect(result.failure.error).toBeInstanceOf(Error);
    expect(result.failure.error.message).toEqual('SOME_ERROR');
  });

  it('"requestBlocks" should send block range request and return a result without content', async () => {
    const error = new Error('SOME_ERROR');
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    (service as any).source = {
      send: jest.fn(),
    };
    const createStaticMock = jest.fn().mockReturnValue({
      toUint8Array: jest.fn(),
    });
    GetBlocksRequest.create = createStaticMock;

    abiRepositoryMock.getCurrentAbi.mockReturnValue({
      isFailure: false,
      content: {
        getTypesMap: () => new Map(),
      },
    } as any);

    const result = await service.requestBlocks(BlockRange.create(0, 1), {
      shouldFetchDeltas: true,
      shouldFetchTraces: true,
    });

    expect((service as any).source.send).toBeCalled();
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();
  });

  it('"requestBlocks" should return a ailure with error when sending request fails', async () => {
    const error = new Error('SOME_ERROR');
    const service = new StateHistoryServiceImpl(
      stateHistorySourceMock,
      abiRepositoryMock
    );
    (service as any).source = {
      send: jest.fn().mockImplementation(() => {
        throw error;
      }),
    };
    const createStaticMock = jest.fn().mockReturnValue({
      toUint8Array: jest.fn(),
    });
    GetBlocksRequest.create = createStaticMock;

    abiRepositoryMock.getCurrentAbi.mockReturnValue({
      isFailure: false,
      content: {
        getTypesMap: () => new Map(),
      },
    } as any);

    const result = await service.requestBlocks(BlockRange.create(0, 1), {
      shouldFetchDeltas: true,
      shouldFetchTraces: true,
    });

    expect((service as any).source.send).toBeCalled();
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });
});
