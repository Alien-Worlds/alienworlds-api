/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { BlockRangeScanRepository } from '@common/block-range-scan/domain/repositories/block-range-scan.repository';
import { RequestBlocksUseCase } from '@common/state-history/domain/use-cases/request-blocks.use-case';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { StateHistoryService } from '@common/state-history/domain/state-history.service';
import { CompleteBlockRangeScanUseCase } from '../complete-block-range-scan.use-case';
import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { WorkerOrchestrator } from '@core/architecture/workers/worker-orchestrator';

jest.mock('@config', () => ({
  config: { blockrangeThreads: 8, blockrangeInviolableThreads: 2 },
}));

jest.mock('@core/architecture/workers/worker.utils', () => ({
  getWorkersCount: () => 2,
}));

const stateHistoryServiceMock = {
  disconnect: jest.fn(),
};
const requestBlocksUseCaseMock = {
  execute: jest.fn(),
};

const blockRangeScanRepositoryMock = {
  startNextScan: jest.fn(),
};

let container: Container;
let useCase: CompleteBlockRangeScanUseCase;

WorkerOrchestrator.sendToOrchestrator = jest.fn();

describe('CompleteBlockRangeScanUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<StateHistoryService>(StateHistoryService.Token)
      .toConstantValue(stateHistoryServiceMock as any);
    container
      .bind<RequestBlocksUseCase>(RequestBlocksUseCase.Token)
      .toConstantValue(requestBlocksUseCaseMock as any);
    container
      .bind<BlockRangeScanRepository>(BlockRangeScanRepository.Token)
      .toConstantValue(blockRangeScanRepositoryMock as any);
    container
      .bind<CompleteBlockRangeScanUseCase>(CompleteBlockRangeScanUseCase.Token)
      .to(CompleteBlockRangeScanUseCase);
  });

  beforeEach(() => {
    useCase = container.get<CompleteBlockRangeScanUseCase>(
      CompleteBlockRangeScanUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(CompleteBlockRangeScanUseCase.Token).not.toBeNull();
  });

  it('Should send message to main thread when state history disconnection failed', async () => {
    stateHistoryServiceMock.disconnect.mockResolvedValue(
      Result.withFailure(Failure.withMessage('FAIL'))
    );

    const result = await useCase.execute(BlockRange.create(0n, 1n), 'test');

    expect(WorkerOrchestrator.sendToOrchestrator).toBeCalled();
    expect(result.failure).toBeUndefined();
    expect(result.content).toBeUndefined();

    stateHistoryServiceMock.disconnect.mockClear();
  });

  it('Should send message to main thread when starting next scan failed', async () => {
    stateHistoryServiceMock.disconnect.mockResolvedValue(
      Result.withoutContent()
    );
    blockRangeScanRepositoryMock.startNextScan.mockResolvedValue(
      Result.withFailure(Failure.withMessage('FAIL'))
    );

    const result = await useCase.execute(BlockRange.create(0n, 1n), 'test');

    expect(WorkerOrchestrator.sendToOrchestrator).toBeCalled();
    expect(result.failure).toBeUndefined();
    expect(result.content).toBeUndefined();

    stateHistoryServiceMock.disconnect.mockClear();
    blockRangeScanRepositoryMock.startNextScan.mockClear();
  });

  it('Should send message to main thread when request for blocks failed', async () => {
    stateHistoryServiceMock.disconnect.mockResolvedValue(
      Result.withoutContent()
    );
    blockRangeScanRepositoryMock.startNextScan.mockResolvedValue(
      Result.withContent({ start: 0n, end: 1n })
    );
    requestBlocksUseCaseMock.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('FAIL'))
    );

    const result = await useCase.execute(BlockRange.create(0n, 1n), 'test');

    expect(WorkerOrchestrator.sendToOrchestrator).toBeCalled();
    expect(result.failure).toBeUndefined();
    expect(result.content).toBeUndefined();

    stateHistoryServiceMock.disconnect.mockClear();
    blockRangeScanRepositoryMock.startNextScan.mockClear();
  });
});
