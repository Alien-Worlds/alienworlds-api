/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { QueueAssetProcessingUseCase } from '../queue-asset-processing.use-case';
import { AssetProcessingQueueServiceImpl } from '@common/data-processing-queue/data/asset-processing-queue.service-impl';
import { AssetProcessingQueueService } from '../../services/asset-processing-queue.service';
import { Result } from '@core/architecture/domain/result';
import { Failure } from '@core/architecture/domain/failure';
import { AssetProcessingJob } from '../../entities/asset-processing.job';

jest.mock('eosjs/dist/eosjs-serialize');

const assetProcessingQueueService = {
  queueJob: jest.fn(() => {}),
} as any;

const assetProcessingQueueServiceMock =
  assetProcessingQueueService as jest.MockedObject<AssetProcessingQueueServiceImpl>;

let container: Container;
let useCase: QueueAssetProcessingUseCase;

describe('QueueAssetProcessingUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<AssetProcessingQueueService>(AssetProcessingQueueService.Token)
      .toConstantValue(assetProcessingQueueService);
    container
      .bind<QueueAssetProcessingUseCase>(QueueAssetProcessingUseCase.Token)
      .to(QueueAssetProcessingUseCase);
  });

  beforeEach(() => {
    useCase = container.get<QueueAssetProcessingUseCase>(
      QueueAssetProcessingUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(QueueAssetProcessingUseCase.Token).not.toBeNull();
  });

  it('Should call service queueJob for each assetId and should return list of not queued ids', async () => {
    const createBufferMock = jest.fn();
    AssetProcessingJob.createBuffer = createBufferMock;

    assetProcessingQueueService.queueJob.mockImplementation(() =>
      Result.withFailure(Failure.fromError(new Error()))
    );
    const result = await (useCase as any).queueJobs([0n, 1n, 2n]);

    expect(assetProcessingQueueService.queueJob).toBeCalledTimes(3);
    expect(result.length).toEqual(3);
  });

  it('Should call service queueJob for each assetId and return an empty list when all the IDs are queued', async () => {
    const createBufferMock = jest.fn();
    AssetProcessingJob.createBuffer = createBufferMock;

    assetProcessingQueueService.queueJob.mockImplementation(() =>
      Result.withoutContent()
    );
    const result = await (useCase as any).queueJobs([0n, 1n, 2n]);

    expect(assetProcessingQueueService.queueJob).toBeCalledTimes(3);
    expect(result.length).toEqual(0);
  });

  it('"execute" should queue jobs on the first try', async () => {
    (useCase as any).queueJobs = jest.fn().mockResolvedValue([]);

    const result = await useCase.execute([0n, 1n, 2n]);

    expect((useCase as any).queueJobs).toBeCalledTimes(1);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();
  });

  it('"execute" should try few times to queue jobs and result with failure if any of them failed', async () => {
    (useCase as any).queueJobs = jest.fn().mockResolvedValue([1n]);

    const result = await useCase.execute([0n, 1n, 2n]);

    expect((useCase as any).queueJobs).toBeCalledTimes(3);
    expect(result.isFailure).toBeTruthy();
  });
});
