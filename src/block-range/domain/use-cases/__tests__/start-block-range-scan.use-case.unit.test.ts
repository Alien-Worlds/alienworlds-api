/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import 'reflect-metadata';
import { StartNextScanUseCase } from '@common/block-range-scan/domain/use-cases/start-next-scan.use-case';
import { RequestBlocksUseCase } from '@common/state-history/domain/use-cases/request-blocks.use-case';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { StartBlockRangeScanUseCase } from '../start-block-range-scan.use-case';
import { WorkerOrchestrator } from '@core/architecture/workers/worker-orchestrator';

jest.mock('@config', () => ({
  config: { blockrangeThreads: 8, blockrangeInviolableThreads: 2 },
}));

jest.mock('@core/architecture/workers/worker.utils', () => ({
  getWorkersCount: () => 2,
}));

const startNextScanUseCaseMock = {
  execute: jest.fn(),
};
const requestBlocksUseCaseMock = {
  execute: jest.fn(),
};

let container: Container;
let useCase: StartBlockRangeScanUseCase;

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
      .bind<StartBlockRangeScanUseCase>(StartBlockRangeScanUseCase.Token)
      .to(StartBlockRangeScanUseCase);
  });

  beforeEach(() => {
    useCase = container.get<StartBlockRangeScanUseCase>(
      StartBlockRangeScanUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(StartBlockRangeScanUseCase.Token).not.toBeNull();
  });

  it('Should send to main thread a message when startNextScanUseCase returns a failure', async () => {
    const sendToOrchestratorMock = jest.fn().mockImplementation();
    WorkerOrchestrator.sendToOrchestrator = sendToOrchestratorMock;

    startNextScanUseCaseMock.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('FAIL'))
    );

    await useCase.execute('test');
    expect(WorkerOrchestrator.sendToOrchestrator).toBeCalled();

    startNextScanUseCaseMock.execute.mockClear();
    sendToOrchestratorMock.mockClear();
  });

  it('Should send to main thread a message when requestBlocksUseCase returns a failure', async () => {
    const sendToOrchestratorMock = jest.fn().mockImplementation();
    WorkerOrchestrator.sendToOrchestrator = sendToOrchestratorMock;

    startNextScanUseCaseMock.execute.mockResolvedValue(
      Result.withContent({ start: 0n, end: 1n })
    );

    requestBlocksUseCaseMock.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('FAIL'))
    );

    await useCase.execute('test');
    expect(sendToOrchestratorMock).toBeCalled();

    sendToOrchestratorMock.mockClear();
    startNextScanUseCaseMock.execute.mockClear();
    requestBlocksUseCaseMock.execute.mockClear();
  });
});
