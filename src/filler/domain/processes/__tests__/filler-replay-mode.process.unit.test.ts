/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { config } from '@config';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { FillerReplayModeProcess } from '../filler-replay-mode.process';
import { GetBlockRangeUseCase } from '../../use-cases/get-block-range.use-case';
import { CreateBlockRangeScanUseCase } from '../../../domain/use-cases/create-block-range-scan.use-case';
import { DuplicateBlockRangeScanError } from '../../../domain/errors/duplicate-block-range-scan.error';
import { BlockRangeScanCreationError } from '../../../domain/errors/block-range-scan-creation.error';

let container: Container;
const getBlocksRangeUseCase = { execute: jest.fn() };
const createBlockRangeScanUseCase = { execute: jest.fn() };
let fillerProcess: FillerReplayModeProcess;

describe('FillerReplayModeProcess Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<GetBlockRangeUseCase>(GetBlockRangeUseCase.Token)
      .toConstantValue(getBlocksRangeUseCase as any);
    container
      .bind<CreateBlockRangeScanUseCase>(CreateBlockRangeScanUseCase.Token)
      .toConstantValue(createBlockRangeScanUseCase as any);
    container
      .bind<FillerReplayModeProcess>(FillerReplayModeProcess.Token)
      .to(FillerReplayModeProcess);
  });

  beforeEach(() => {
    fillerProcess = container.get<FillerReplayModeProcess>(
      FillerReplayModeProcess.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(FillerReplayModeProcess.Token).not.toBeNull();
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
        expect(getBlocksRangeUseCase.execute).toBeCalledWith(0n, 1n, true);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual('Missing blocks range');
      });
  });

  it('Should call createBlockRangeScan use case and after that stop the process', async () => {
    config.blockRangeScan.scanKey = 'test';
    const stopMock = jest.spyOn(fillerProcess, 'stop').mockImplementation();
    getBlocksRangeUseCase.execute.mockImplementation(() =>
      Result.withContent({ start: 0n, end: 1n })
    );
    createBlockRangeScanUseCase.execute.mockImplementation(() =>
      Result.withoutContent()
    );

    await fillerProcess.start({
      startBlock: 0n,
      endBlock: 1n,
    } as any);

    expect(createBlockRangeScanUseCase.execute).toBeCalledWith('test', 0n, 1n);
    expect(stopMock).toBeCalledWith('test', 0n, 1n);

    stopMock.mockClear();
  });

  it('Should call createBlockRangeScan use case and throw error on failure', async () => {
    config.blockRangeScan.scanKey = 'test';
    const createBlocksRangeError = new Error();
    createBlocksRangeError.name = DuplicateBlockRangeScanError.Token;

    getBlocksRangeUseCase.execute.mockImplementation(() =>
      Result.withContent({ start: 0n, end: 1n })
    );
    createBlockRangeScanUseCase.execute.mockImplementation(() =>
      Result.withFailure(Failure.fromError(createBlocksRangeError))
    );

    await fillerProcess
      .start({
        startBlock: 0n,
        endBlock: 1n,
      } as any)
      .catch(error => {
        expect(createBlockRangeScanUseCase.execute).toBeCalledWith(
          'test',
          0n,
          1n
        );
        expect(error.name).toEqual(BlockRangeScanCreationError.Token);
      });
  });
});
