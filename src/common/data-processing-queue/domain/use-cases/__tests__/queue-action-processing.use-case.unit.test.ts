/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { QueueActionProcessingUseCase } from '../queue-action-processing.use-case';
import { ActionProcessingQueueServiceImpl } from '@common/data-processing-queue/data/action-processing-queue.service-impl';
import { ActionProcessingQueueService } from '../../services/action-processing-queue.service';
import { ActionTrace } from '@common/actions/domain/entities/action-trace';
import { config } from '@config';
import { ActionProcessingJob } from '../../entities/action-processing.job';

jest.mock('eosjs/dist/eosjs-serialize');

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

const actionProcessingQueueService = {
  queueJob: jest.fn(() => {}),
} as any;

const actionProcessingQueueServiceMock =
  actionProcessingQueueService as jest.MockedObject<ActionProcessingQueueServiceImpl>;

let container: Container;
let useCase: QueueActionProcessingUseCase;

describe('QueueActionProcessingUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<ActionProcessingQueueService>(ActionProcessingQueueService.Token)
      .toConstantValue(actionProcessingQueueService);
    container
      .bind<QueueActionProcessingUseCase>(QueueActionProcessingUseCase.Token)
      .to(QueueActionProcessingUseCase);
  });

  beforeEach(() => {
    useCase = container.get<QueueActionProcessingUseCase>(
      QueueActionProcessingUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(QueueActionProcessingUseCase.Token).not.toBeNull();
  });

  it('Should call service queueJob', async () => {
    (config.miningContract as any) = 'foo.account';
    const createBufferMock = jest.fn();
    ActionProcessingJob.createBuffer = createBufferMock;

    actionProcessingQueueService.queueJob.mockReturnValue(() =>
      Result.withoutContent()
    );

    const { content, failure } = await useCase.execute(
      0n,
      actionTrace,
      'trace_id',
      new Date('2022-07-01T09:59:29.035Z')
    );

    expect(actionProcessingQueueService.queueJob).toBeCalled();
    expect(createBufferMock).toBeCalled();
    expect(content).toBeUndefined();
    expect(failure).toBeUndefined();
  });

  it('Should return a result with no content when one of the conditions is not met', async () => {
    (config.miningContract as any) = '';

    const createBufferMock = jest.fn();
    ActionProcessingJob.createBuffer = createBufferMock;

    actionProcessingQueueService.queueJob.mockReturnValue(() =>
      Result.withoutContent()
    );

    const { content, failure } = await useCase.execute(
      0n,
      actionTrace,
      'trace_id',
      new Date('2022-07-01T09:59:29.035Z')
    );

    expect(actionProcessingQueueService.queueJob).not.toBeCalled();
    expect(createBufferMock).not.toBeCalled();
    expect(content).toBeUndefined();
    expect(failure).toBeUndefined();
  });

  it('Should return a result with no content when one of the conditions is not met', async () => {
    (config.miningContract as any) = 'foo.account';

    const createBufferMock = jest.fn();
    ActionProcessingJob.createBuffer = createBufferMock;

    actionProcessingQueueService.queueJob.mockReturnValue(() =>
      Result.withoutContent()
    );

    const { content, failure } = await useCase.execute(
      0n,
      actionTrace,
      'trace_id',
      new Date('2022-07-01T09:59:29.035Z')
    );

    expect(content).toBeUndefined();
    expect(failure).toBeUndefined();
  });

  it('Should result with failure when job queuing fails', async () => {
    (config.miningContract as any) = 'foo.account';

    const createBufferMock = jest.fn();
    ActionProcessingJob.createBuffer = createBufferMock;

    actionProcessingQueueService.queueJob.mockImplementation(() =>
      Result.withFailure(Failure.fromError(new Error()))
    );

    const result = await useCase.execute(
      0n,
      actionTrace,
      'trace_id',
      new Date('2022-07-01T09:59:29.035Z')
    );

    expect(result.isFailure).toBeTruthy();
  });
});
