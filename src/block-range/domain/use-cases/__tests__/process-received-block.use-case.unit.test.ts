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
import { config } from '@config';
import { ActionTrace } from '@common/actions/domain/entities/action-trace';

jest.mock('@common/state-history/domain/state-history.utils');

const actionTrace = ActionTrace.create('action_trace_v0', {
  action_ordinal: 1,
  creator_action_ordinal: 1,
  receipt: [
    'foo',
    {
      receiver: 'foo.account',
      act_digest: 'act',
      global_sequence: '100',
      recv_sequence: '100',
      auth_sequence: [{ account: 'foo', sequence: 'foo_sequence' }],
      code_sequence: 100,
      abi_sequence: 100,
    },
  ],
  receiver: 'foo.account',
  act: {
    account: 'foo.account',
    name: 'logmine',
    authorization: {
      actor: 'foo.actor',
      permission: 'foo.permission',
    },
    data: [] as any,
  },
  context_free: true,
  elapsed: 'elapsed',
  console: 'foo_console',
  account_ram_deltas: [],
  except: '',
  error_code: '200',
});

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

  it('Should call queueActionProcessingJobs on each trace when the conditions are met', async () => {
    const queueActionProcessingJobsMock = jest
      .spyOn(useCase as any, 'queueActionProcessingJobs')
      .mockImplementation();

    const result = await useCase.execute(
      'test',
      {
        thisBlock: { blockNumber: 10n },
        traces: [
          {
            type: 'transaction_trace_v0',
            id: 'fake_id',
            actionTraces: [actionTrace, actionTrace],
          },
        ],
        block: { timestamp: new Date() },
      } as any,
      BlockRange.create(0n, 2n)
    );

    expect(queueActionProcessingJobsMock).toBeCalledTimes(1);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();

    queueActionProcessingJobsMock.mockClear();
  });

  it('"queueActionProcessingJobs" should call queueActionProcessing use case for each action trace', async () => {
    config.atomicAssets.contract = 'foo.account';

    queueActionProcessingUseCaseMock.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('something went wrong'))
    );
    const trace = {
      type: 'transaction_trace_v0',
      id: 'foo.account',
      actionTraces: [actionTrace, actionTrace],
    };

    await (useCase as any).queueActionProcessingJobs(trace, 10n, new Date());

    expect(queueActionProcessingUseCaseMock.execute).toBeCalledTimes(2);
    expect(logMock).toBeCalledTimes(2);
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
