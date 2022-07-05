/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { Failure } from '@core/architecture/domain/failure';
import { ProcessReceivedBlockUseCase } from '../process-received-block.use-case';
import { QueueActionProcessingUseCase } from '@common/data-processing-queue/domain/use-cases/queue-action-processing.use-case';
import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { log } from '@common/state-history/domain/state-history.utils';
import { BlockRangeScanRepository } from '@common/block-range-scan/domain/repositories/block-range-scan.repository';

jest.mock('@common/state-history/domain/state-history.utils');

const logMock = log as jest.MockedFunction<any>;

const queueActionProcessingUseCaseMock = { execute: jest.fn() };
const blockRangeScanRepositoryMock = { updateScannedBlockNumber: jest.fn() };
let container: Container;
let useCase: ProcessReceivedBlockUseCase;

describe('ProcessReceivedBlockUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<QueueActionProcessingUseCase>(QueueActionProcessingUseCase.Token)
      .toConstantValue(queueActionProcessingUseCaseMock as any);
    container
      .bind<BlockRangeScanRepository>(BlockRangeScanRepository.Token)
      .toConstantValue(blockRangeScanRepositoryMock as any);
    container
      .bind<ProcessReceivedBlockUseCase>(ProcessReceivedBlockUseCase.Token)
      .to(ProcessReceivedBlockUseCase);
  });

  beforeEach(() => {
    useCase = container.get<ProcessReceivedBlockUseCase>(
      ProcessReceivedBlockUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(ProcessReceivedBlockUseCase.Token).not.toBeNull();
  });

  it('Should log stats every 1000 blocks', async () => {
    blockRangeScanRepositoryMock.updateScannedBlockNumber.mockResolvedValue(
      Result.withoutContent()
    );
    const result = await useCase.execute(
      'test',
      {
        thisBlock: { blockNumber: 1000n },
        traces: [],
        block: { timestamp: new Date() },
      } as any,
      BlockRange.create(0n, 2n)
    );

    expect(logMock).toBeCalledTimes(2);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();
  });

  it('Should call queueActionProcessingUseCaseMock on each trace when the conditions are met and return result without content', async () => {
    queueActionProcessingUseCaseMock.execute.mockResolvedValue(
      Result.withoutContent()
    );
    blockRangeScanRepositoryMock.updateScannedBlockNumber.mockResolvedValue(
      Result.withoutContent()
    );

    const result = await useCase.execute(
      'test',
      {
        thisBlock: { blockNumber: 10n },
        traces: [
          {
            type: 'transaction_trace_v0',
            id: 'fake_id',
            actionTraces: [{}],
          },
        ],
        block: { timestamp: new Date() },
      } as any,
      BlockRange.create(0n, 2n)
    );

    expect(queueActionProcessingUseCaseMock.execute).toBeCalledTimes(1);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();
  });

  it('Should result with failure when updating block number fails', async () => {
    queueActionProcessingUseCaseMock.execute.mockResolvedValue(
      Result.withoutContent()
    );
    blockRangeScanRepositoryMock.updateScannedBlockNumber.mockResolvedValue(
      Result.withFailure(Failure.withMessage('FAIL'))
    );

    const result = await useCase.execute(
      'test',
      {
        thisBlock: { blockNumber: 10n },
        traces: [
          {
            type: 'transaction_trace_v0',
            id: 'fake_id',
            actionTraces: [{}],
          },
        ],
        block: { timestamp: new Date() },
      } as any,
      BlockRange.create(0n, 2n)
    );

    expect(
      blockRangeScanRepositoryMock.updateScannedBlockNumber
    ).toBeCalledTimes(1);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });
});
