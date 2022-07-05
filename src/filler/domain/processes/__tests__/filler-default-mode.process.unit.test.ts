/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Failure } from '@core/architecture/domain/failure';
import { Container } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { FillerDefaultModeProcess } from '../filler-default-mode.process';
import { GetBlockRangeUseCase } from '../../../domain/use-cases/get-block-range.use-case';
import { RequestBlocksUseCase } from '@common/state-history/domain/use-cases/request-blocks.use-case';

let container: Container;
const getBlocksRangeUseCase = { execute: jest.fn() };
const requestBlocksUseCase = { execute: jest.fn() };
let fillerProcess: FillerDefaultModeProcess;

describe('FillerDefaultModeProcess Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<GetBlockRangeUseCase>(GetBlockRangeUseCase.Token)
      .toConstantValue(getBlocksRangeUseCase as any);
    container
      .bind<RequestBlocksUseCase>(RequestBlocksUseCase.Token)
      .toConstantValue(requestBlocksUseCase as any);
    container
      .bind<FillerDefaultModeProcess>(FillerDefaultModeProcess.Token)
      .to(FillerDefaultModeProcess);
  });

  beforeEach(() => {
    fillerProcess = container.get<FillerDefaultModeProcess>(
      FillerDefaultModeProcess.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(FillerDefaultModeProcess.Token).not.toBeNull();
  });

  it('Should throw error if no block range was found', async () => {
    getBlocksRangeUseCase.execute.mockImplementation(() =>
      Result.withFailure(Failure.fromError(new Error()))
    );

    await fillerProcess
      .start({
        startBlock: 0n,
        endBlock: 1n,
      } as any)
      .catch(error => {
        expect(getBlocksRangeUseCase.execute).toBeCalledWith(0n, 1n, false);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual('Missing blocks range');
      });
  });

  it('Should call requestBlocks use case', async () => {
    getBlocksRangeUseCase.execute.mockImplementation(() =>
      Result.withContent({ start: 0n, end: 1n })
    );
    requestBlocksUseCase.execute.mockImplementation(() =>
      Result.withoutContent()
    );

    await fillerProcess.start({
      startBlock: 0n,
      endBlock: 1n,
    } as any);

    expect(requestBlocksUseCase.execute).toBeCalledWith(0n, 1n);
  });

  it('Should throw an error if the block request has failed', async () => {
    const requestBlocksError = new Error('REQUEST_BLOCK_ERROR');
    getBlocksRangeUseCase.execute.mockImplementation(() =>
      Result.withContent({ start: 0n, end: 1n })
    );
    requestBlocksUseCase.execute.mockImplementation(() =>
      Result.withFailure(Failure.fromError(requestBlocksError))
    );

    await fillerProcess
      .start({
        startBlock: 0n,
        endBlock: 1n,
      } as any)
      .catch(error => {
        expect(error.message).toEqual(requestBlocksError.message);
      });
  });
});
