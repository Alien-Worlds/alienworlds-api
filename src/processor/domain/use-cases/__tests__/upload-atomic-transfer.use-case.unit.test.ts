/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { NftMessageData } from '@common/nfts/data/nfts.dtos';
import { deserialize, ObjectSchema } from 'atomicassets';
import { Failure } from '@core/architecture/domain/failure';
import { AtomicTransfer } from '@common/atomic-transfers/domain/entities/atomic-transfer';
import { config } from '@config';
import { DeserializeActionJobUseCase } from '../deserialize-action-job.use-case';
import {
  DataSourceOperationError,
  OperationErrorType,
} from '@core/architecture/data/errors/data-source-operation.error';
import { AtomicTransferRepository } from '@common/atomic-transfers/domain/repositories/atomic-transfer.repository';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { UploadAtomicTransferUseCase } from '../upload-atomic-transfer.use-case';
import { QueueAssetProcessingUseCase } from '@common/data-processing-queue/domain/use-cases/queue-asset-processing.use-case';
import { CollectionMismatchError } from '../../../domain/errors/collection-mismatch.error';

jest.mock('@config');
const configMock = config as jest.MockedObject<typeof config>;

jest.mock('atomicassets');
const ObjectSchemaMock = ObjectSchema as jest.MockedFunction<
  typeof ObjectSchema
>;
const deserializeMock = deserialize as jest.MockedFunction<typeof deserialize>;
const deserializeActionJobUseCaseMock = {
  execute: jest.fn(),
} as any;
const atomicTransferRepositoryMock = { add: jest.fn() };
const actionProcessingQueueServiceMock = {
  ackJob: jest.fn(),
  rejectJob: jest.fn(),
};
const queueAssetProcessingUseCaseMock = { execute: jest.fn() };

let container: Container;
let useCase: UploadAtomicTransferUseCase;

describe('UploadAtomicTransferUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<DeserializeActionJobUseCase>(DeserializeActionJobUseCase.Token)
      .toConstantValue(deserializeActionJobUseCaseMock);
    container
      .bind<AtomicTransferRepository>(AtomicTransferRepository.Token)
      .toConstantValue(atomicTransferRepositoryMock as any);
    container
      .bind<ActionProcessingQueueService>(ActionProcessingQueueService.Token)
      .toConstantValue(actionProcessingQueueServiceMock as any);
    container
      .bind<QueueAssetProcessingUseCase>(QueueAssetProcessingUseCase.Token)
      .toConstantValue(queueAssetProcessingUseCaseMock as any);
    container
      .bind<UploadAtomicTransferUseCase>(UploadAtomicTransferUseCase.Token)
      .to(UploadAtomicTransferUseCase);
  });

  beforeEach(() => {
    useCase = container.get<UploadAtomicTransferUseCase>(
      UploadAtomicTransferUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(UploadAtomicTransferUseCase.Token).not.toBeNull();
  });

  it('"createAtomicTransferEntity" should return AtomicTransfer entity', async () => {
    configMock.atomicAssets.collection = 'foo.collection';
    const message = {
      account: 'foo',
      name: 'bar',
      data: '',
      blockNumber: 0n,
      blockTimestamp: new Date(''),
      globalSequence: 0n,
      transactionId: 'trx-id-01',
    } as any;
    const deserializedData = {
      collection_name: configMock.atomicAssets.collection,
      from: 'from.foo',
      to: 'to.bar',
      asset_ids: ['0'],
      asset_id: '0',
      new_asset_owner: 'foo',
      asset_owner: 'foo',
    } as any;
    ObjectSchemaMock.mockReturnValue({} as any);
    deserializeMock.mockReturnValue({} as any);
    const executeMock = jest
      .spyOn(deserializeActionJobUseCaseMock, 'execute')
      .mockReturnValue(Result.withContent<NftMessageData>(deserializedData));
    // @ts-ignore
    const result = await useCase.createAtomicTransferEntity(message);
    expect(result.content).toEqual(
      AtomicTransfer.fromMessage(message, deserializedData)
    );

    executeMock.mockClear();
  });

  it('"createAtomicTransferEntity" should return a failure when deserialization has failed', async () => {
    configMock.atomicAssets.collection = 'foo.collection';
    const message = {
      account: 'foo',
      name: 'bar',
      data: '',
      blockNumber: 0n,
      blockTimestamp: new Date(''),
      globalSequence: 0n,
      transactionId: 'trx-id-01',
    } as any;
    ObjectSchemaMock.mockReturnValue({} as any);
    deserializeMock.mockReturnValue({
      collection_name: 'bar.collection',
    } as any);
    const executeMock = jest
      .spyOn(deserializeActionJobUseCaseMock, 'execute')
      .mockReturnValue(Result.withContent(deserializeMock));
    // @ts-ignore
    const result = await useCase.createAtomicTransferEntity(message);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);

    executeMock.mockClear();
  });

  it('"createAtomicTransferEntity" should return a failure when collection names are different', async () => {
    configMock.atomicAssets.collection = 'foo.collection';
    const message = {
      account: 'foo',
      name: 'bar',
      data: '',
      blockNumber: 0n,
      blockTimestamp: new Date(''),
      globalSequence: 0n,
      transactionId: 'trx-id-01',
    } as any;
    ObjectSchemaMock.mockReturnValue({} as any);
    deserializeMock.mockReturnValue({} as any);
    const executeMock = jest
      .spyOn(deserializeActionJobUseCaseMock, 'execute')
      .mockReturnValue(Result.withFailure(Failure.withMessage('some error')));
    // @ts-ignore
    const result = await useCase.createAtomicTransferEntity(message);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);

    executeMock.mockClear();
  });

  it('Should trigger "createAtomicTransferEntity"', async () => {
    configMock.atomicAssets.contract = 'foo.contract';

    const createAtomicTransferEntityMock = jest.spyOn(
      useCase as any,
      'createAtomicTransferEntity'
    );

    await useCase.execute({
      account: configMock.atomicAssets.contract,
      name: 'logtransfer',
    } as any);

    expect(createAtomicTransferEntityMock).toBeCalled();

    createAtomicTransferEntityMock.mockClear();
  });

  it('Should ack job and return failure when inserting entity to the datatbase failed due to duplication error', async () => {
    (DataSourceOperationError as any).getTypeByErrorMessage = () =>
      OperationErrorType.Duplicate;
    const job = {};
    const error = DataSourceOperationError.fromError(new Error());
    const createAtomicTransferEntityMock = jest
      .spyOn(useCase as any, 'createAtomicTransferEntity')
      .mockResolvedValue(Result.withContent({}));
    atomicTransferRepositoryMock.add.mockImplementation(() =>
      Result.withFailure(Failure.fromError<DataSourceOperationError>(error))
    );

    const result = await useCase.execute(job as any);

    expect(actionProcessingQueueServiceMock.ackJob).toBeCalledWith(job);
    expect((result.failure.error as DataSourceOperationError).type).toEqual(
      OperationErrorType.Duplicate
    );

    createAtomicTransferEntityMock.mockClear();
  });

  it('Should ack job and return failure when entity creation failed with CollectionMismatchError', async () => {
    (DataSourceOperationError as any).getTypeByErrorMessage = () =>
      OperationErrorType.Duplicate;
    const job = {};
    const createAtomicTransferEntityMock = jest
      .spyOn(useCase as any, 'createAtomicTransferEntity')
      .mockResolvedValue(
        Result.withFailure(
          Failure.fromError(new CollectionMismatchError('foo', 'bar'))
        )
      );

    const result = await useCase.execute(job as any);

    expect(actionProcessingQueueServiceMock.ackJob).toBeCalledWith(job);
    expect(result.failure.error).toBeInstanceOf(CollectionMismatchError);

    createAtomicTransferEntityMock.mockClear();
  });

  it('Should reject job and return failure when inserting entity to the datatbase failed for other reason than duplicated data', async () => {
    (DataSourceOperationError as any).getTypeByErrorMessage = () =>
      OperationErrorType.Other;

    const job = {};
    const error = DataSourceOperationError.fromError(new Error());
    const createAtomicTransferEntityMock = jest
      .spyOn(useCase as any, 'createAtomicTransferEntity')
      .mockResolvedValue(Result.withContent({}));
    atomicTransferRepositoryMock.add.mockImplementation(() =>
      Result.withFailure(Failure.fromError(error))
    );

    const result = await useCase.execute(job as any);

    expect(actionProcessingQueueServiceMock.rejectJob).toBeCalledWith(job);
    expect((result.failure.error as DataSourceOperationError).type).toEqual(
      OperationErrorType.Other
    );

    createAtomicTransferEntityMock.mockClear();
  });

  it('Should return failure when asset processing has not been queued', async () => {
    const job = {};
    atomicTransferRepositoryMock.add.mockImplementation(() =>
      Result.withContent({ assetsIds: [] })
    );
    queueAssetProcessingUseCaseMock.execute.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('FAIL'))
    );
    const result = await useCase.execute(job as any);

    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('Should ack job when asset porcessing job has been queued', async () => {
    const job = {};
    const createAtomicTransferEntityMock = jest
      .spyOn(useCase as any, 'createAtomicTransferEntity')
      .mockResolvedValue(Result.withContent({}));
    atomicTransferRepositoryMock.add.mockImplementation(() =>
      Result.withContent({ assetsIds: [] })
    );
    queueAssetProcessingUseCaseMock.execute.mockImplementation(() =>
      Result.withoutContent()
    );
    const result = await useCase.execute(job as any);

    expect(actionProcessingQueueServiceMock.ackJob).toBeCalledWith(job);

    expect(result.failure).toBeUndefined();
    expect(result.content).toBeUndefined();

    createAtomicTransferEntityMock.mockClear();
  });
});
