/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { ProcessActionUseCase } from '../process-action.use-case';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { Failure } from '@core/architecture/domain/failure';
import { UploadMineUseCase } from '../upload-mine.use-case';
import { UploadNftUseCase } from '../upload-nft.use-case';
import { UploadAtomicTransferUseCase } from '../upload-atomic-transfer.use-case';
import { config } from '@config';

const uploadMineUseCaseMock = { execute: jest.fn() };
const uploadNftUseCaseMock = { execute: jest.fn() };
const uploadAtomicTransferUseCaseMock = { execute: jest.fn() };
const actionProcessingQueueServiceMock = {
  ackJob: jest.fn(),
};

let container: Container;
let useCase: ProcessActionUseCase;

describe('ProcessActionUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<UploadMineUseCase>(UploadMineUseCase.Token)
      .toConstantValue(uploadMineUseCaseMock as any);
    container
      .bind<UploadNftUseCase>(UploadNftUseCase.Token)
      .toConstantValue(uploadNftUseCaseMock as any);
    container
      .bind<UploadAtomicTransferUseCase>(UploadAtomicTransferUseCase.Token)
      .toConstantValue(uploadAtomicTransferUseCaseMock as any);
    container
      .bind<ActionProcessingQueueService>(ActionProcessingQueueService.Token)
      .toConstantValue(actionProcessingQueueServiceMock as any);
    container
      .bind<ProcessActionUseCase>(ProcessActionUseCase.Token)
      .to(ProcessActionUseCase);
  });

  beforeEach(() => {
    useCase = container.get<ProcessActionUseCase>(ProcessActionUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(ProcessActionUseCase.Token).not.toBeNull();
  });

  it('Should return failure when action label is unknown', async () => {
    const result = await useCase.execute({
      account: 'foo',
      name: 'logsomething',
    } as any);

    expect(actionProcessingQueueServiceMock.ackJob).toBeCalled();
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('Should call uploadMineUseCase when action label equals "m.federation::logmine"', async () => {
    uploadMineUseCaseMock.execute.mockImplementation();
    const job = { account: 'm.federation', name: 'logmine' };
    await useCase.execute(job as any);

    expect(uploadMineUseCaseMock.execute).toBeCalled();
  });

  it('Should call uploadNftUseCase when action label equals "m.federation::logrand"', async () => {
    uploadNftUseCaseMock.execute.mockImplementation();
    const job = { account: 'm.federation', name: 'logrand' };
    await useCase.execute(job as any);

    expect(uploadNftUseCaseMock.execute).toBeCalled();
  });

  it('Should call uploadMineUseCase when action label equals "m.federation::logtransfer.logmint/logburn"', async () => {
    config.atomicAssets.contract = 'foo';

    uploadAtomicTransferUseCaseMock.execute.mockImplementation();

    await useCase.execute({ account: 'foo', name: 'logtransfer' } as any);
    await useCase.execute({ account: 'foo', name: 'logmint' } as any);
    await useCase.execute({ account: 'foo', name: 'logburn' } as any);

    expect(uploadAtomicTransferUseCaseMock.execute).toBeCalledTimes(3);
  });
});
