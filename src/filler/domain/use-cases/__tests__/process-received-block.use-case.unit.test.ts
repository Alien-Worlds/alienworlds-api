/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { Failure } from '@core/architecture/domain/failure';
import { ProcessReceivedBlockUseCase } from '../process-received-block.use-case';
import { QueueActionProcessingUseCase } from '@common/data-processing-queue/domain/use-cases/queue-action-processing.use-case';
import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { log } from '@common/state-history/domain/state-history.utils';

jest.mock('@common/state-history/domain/state-history.utils');

const logMock = log as jest.MockedFunction<any>;

const queueActionProcessingUseCaseMock = { execute: jest.fn() };
let container: Container;
let useCase: ProcessReceivedBlockUseCase;

describe('ProcessReceivedBlockUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<QueueActionProcessingUseCase>(QueueActionProcessingUseCase.Token)
      .toConstantValue(queueActionProcessingUseCaseMock as any);
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
    const result = await useCase.execute(
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

  it('Should log each queueActionProcessingUseCaseMock failure on each trace when the conditions are met', async () => {
    queueActionProcessingUseCaseMock.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('something went wrong'))
    );

    const result = await useCase.execute(
      {
        thisBlock: { blockNumber: 10n },
        traces: [
          {
            type: 'transaction_trace_v0',
            id: 'fake_id',
            actionTraces: [{}, {}],
          },
        ],
        block: { timestamp: new Date() },
      } as any,
      BlockRange.create(0n, 2n)
    );

    expect(queueActionProcessingUseCaseMock.execute).toBeCalledTimes(2);
    expect(logMock).toBeCalledTimes(2);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();
  });

  it('Should call queueActionProcessingUseCaseMock on each trace when the conditions are met and return result without content', async () => {
    queueActionProcessingUseCaseMock.execute.mockResolvedValue(
      Result.withoutContent()
    );

    const result = await useCase.execute(
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
});
