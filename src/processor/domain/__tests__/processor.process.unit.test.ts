/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { ProcessorProcess } from '../processor.process';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { AssetProcessingQueueService } from '@common/data-processing-queue/domain/services/asset-processing-queue.service';
import { ProcessActionUseCase } from '../use-cases/process-action.use-case';
import { ProcessAssetUseCase } from '../use-cases/process-asset.use-case';

let container: Container;
const actionProcessingQueueServiceMock = { addJobHandler: jest.fn() };
const assetProcessingQueueServiceMock = { addJobHandler: jest.fn() };
const processActionUseCaseMock = { execute: jest.fn() };
const processAssetUseCaseMock = { execute: jest.fn() };
let processor: ProcessorProcess;

describe('ProcessorProcess Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<ActionProcessingQueueService>(ActionProcessingQueueService.Token)
      .toConstantValue(actionProcessingQueueServiceMock as any);
    container
      .bind<AssetProcessingQueueService>(AssetProcessingQueueService.Token)
      .toConstantValue(assetProcessingQueueServiceMock as any);
    container
      .bind<ProcessActionUseCase>(ProcessActionUseCase.Token)
      .toConstantValue(processActionUseCaseMock as any);
    container
      .bind<ProcessAssetUseCase>(ProcessAssetUseCase.Token)
      .toConstantValue(processAssetUseCaseMock as any);
    container
      .bind<ProcessorProcess>(ProcessorProcess.Token)
      .to(ProcessorProcess);
  });

  beforeEach(() => {
    processor = container.get<ProcessorProcess>(ProcessorProcess.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(ProcessorProcess.Token).not.toBeNull();
  });

  it('Should add action and asset processing job handlers', async () => {
    await processor.start();

    expect(actionProcessingQueueServiceMock.addJobHandler).toBeCalled();
    expect(assetProcessingQueueServiceMock.addJobHandler).toBeCalled();
  });

  it('Should send error message to the orchestrator on any error', async () => {
    actionProcessingQueueServiceMock.addJobHandler.mockImplementation(() => {
      throw new Error();
    });

    const sendToMainThreadMock = jest
      .spyOn(processor, 'sendToMainThread')
      .mockImplementation();

    await processor.start();

    expect(actionProcessingQueueServiceMock.addJobHandler).toBeCalled();
    expect(sendToMainThreadMock).toBeCalled();

    sendToMainThreadMock.mockClear();
  });
});
