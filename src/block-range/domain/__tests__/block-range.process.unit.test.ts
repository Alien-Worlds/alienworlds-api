/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { BlockRangeScanRepository } from '@common/block-range-scan/domain/repositories/block-range-scan.repository';
import { StartNextScanUseCase } from '@common/block-range-scan/domain/use-cases/start-next-scan.use-case';
import { RequestBlocksUseCase } from '@common/state-history/domain/use-cases/request-blocks.use-case';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import 'reflect-metadata';
import { BlockRangeProcess } from '../block-range.process';
import { BlockRangeScanReadTimeoutError } from '../errors/block-range-scan-read-timeout.error';

jest.mock('@config', () => ({
  config: { blockrangeThreads: 8, blockrangeInviolableThreads: 2 },
}));

jest.mock('@common/utils/worker.utils', () => ({
  getWorkersCount: () => 2,
}));

const startNextScanUseCaseMock = {
  execute: jest.fn(),
};
const requestBlocksUseCaseMock = {
  execute: jest.fn(),
};

const blockRangeScanRepositoryMock = {
  hasUnscannedNodes: jest.fn(),
};

let container: Container;
let program: BlockRangeProcess;

describe('BlockRange Process Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<StartNextScanUseCase>(StartNextScanUseCase.Token)
      .toConstantValue(startNextScanUseCaseMock as any);
    container
      .bind<RequestBlocksUseCase>(RequestBlocksUseCase.Token)
      .toConstantValue(requestBlocksUseCaseMock as any);
    container
      .bind<BlockRangeScanRepository>(BlockRangeScanRepository.Token)
      .toConstantValue(blockRangeScanRepositoryMock as any);
    container
      .bind<BlockRangeProcess>(BlockRangeProcess.Token)
      .to(BlockRangeProcess);
  });

  beforeEach(() => {
    program = container.get<BlockRangeProcess>(BlockRangeProcess.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(BlockRangeProcess.Token).not.toBeNull();
  });

  it('Should send to main thread a message when startNextScanUseCase returns a failure', async () => {
    const waitUntilBlockRangesAreSetMock = jest
      .spyOn(program as any, 'waitUntilBlockRangesAreSet')
      .mockResolvedValue(true);
    const sendToMainThreadMock = jest
      .spyOn(program as any, 'sendToMainThread')
      .mockImplementation();

    startNextScanUseCaseMock.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('FAIL'))
    );

    await program.start('test');
    expect(sendToMainThreadMock).toBeCalled();

    waitUntilBlockRangesAreSetMock.mockClear();
    sendToMainThreadMock.mockClear();
    startNextScanUseCaseMock.execute.mockClear();
  });

  it('Should send to main thread a message when requestBlocksUseCase returns a failure', async () => {
    const waitUntilBlockRangesAreSetMock = jest
      .spyOn(program as any, 'waitUntilBlockRangesAreSet')
      .mockResolvedValue(true);
    const sendToMainThreadMock = jest
      .spyOn(program as any, 'sendToMainThread')
      .mockImplementation();

    startNextScanUseCaseMock.execute.mockResolvedValue(
      Result.withContent({ start: 0n, end: 1n })
    );

    requestBlocksUseCaseMock.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('FAIL'))
    );

    await program.start('test');
    expect(sendToMainThreadMock).toBeCalled();

    waitUntilBlockRangesAreSetMock.mockClear();
    sendToMainThreadMock.mockClear();
    startNextScanUseCaseMock.execute.mockClear();
    requestBlocksUseCaseMock.execute.mockClear();
  });

  it('"waitUntilBlockRangesAreSet" should reject with BlockRangeScanReadTimeoutError when blocks could not be found in the specified number of tries', async () => {
    blockRangeScanRepositoryMock.hasUnscannedNodes.mockResolvedValue(
      Result.withContent(false)
    );
    await (program as any)
      .waitUntilBlockRangesAreSet('test', 2)
      .catch(error => {
        expect(error).toBeInstanceOf(BlockRangeScanReadTimeoutError);
      });
  });

  it('"waitUntilBlockRangesAreSet" should resolve promise when blocks with the specified key are found', async () => {
    blockRangeScanRepositoryMock.hasUnscannedNodes.mockResolvedValue(
      Result.withContent(true)
    );
    const result = await (program as any);

    expect(result).toBeTruthy();
  });
});
