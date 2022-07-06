/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { ProcessActionUseCase } from '../process-action.use-case';
import { CreateEntityFromActionUseCase } from '../create-entity-from-action.use-case';
import { AtomicTransferRepository } from '@common/atomic-transfers/domain/repositories/atomic-transfer.repository';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { QueueAssetProcessingUseCase } from '@common/data-processing-queue/domain/use-cases/queue-asset-processing.use-case';
import { MineRepository } from '@common/mines/domain/mine.repository';
import { NftRepository } from '@common/nfts/domain/repositories/nft.repository';
import { Failure } from '@core/architecture/domain/failure';
import { CollectionMismatchError } from '../../../domain/errors/collection-mismatch.error';
import { Mine } from '@common/mines/domain/entities/mine';
import { MineDocument } from '@common/mines/data/mines.dtos';
import { NftDocument } from '@common/nfts/data/nfts.dtos';
import { NFT } from '@common/nfts/domain/entities/nft';
import { Long } from 'mongodb';
import { AtomicTransfer } from '@common/atomic-transfers/domain/entities/atomic-transfer';
import { AtomicTransferDocument } from '@common/atomic-transfers/data/atomic-transfers.dtos';
import { UnhandledEntityError } from '../../../domain/errors/unhandled-entity.error';
import {
  DataSourceOperationError,
  OperationErrorType,
} from '@core/architecture/data/errors/data-source-operation.error';
import { InsertError } from '@common/mines/domain/errors/insert.error';

const sampleMineDocument: MineDocument = {
  _id: '62fd3a3bcc6d81005d135799',
  miner: 'fake.wam',
  params: {
    invalid: 0,
    error: '',
    delay: 560,
    difficulty: 0,
    ease: 69,
    luck: 6,
    commission: 95,
  },
  bounty: 837,
  land_id: '1099512958747',
  planet_name: 'neri.world',
  landowner: 'fakeowner.wam',
  bag_items: [1099575138963n, 1099571561418n, 1099572783734n],
  offset: 125,
  block_num: 165058267n,
  block_timestamp: new Date('2022-02-04T14:34:53Z'),
  global_sequence: 37593403954n,
  tx_id: '92f0f074f841cafba129c28f65e551f022f7a2b5ba2fdc3463291fc7aee29ce1',
} as any;

const sampleNFTDocument: NftDocument = {
  _id: '61eee6039181c700422ef773',
  miner: 'fakeminer1.wam',
  land_id: '1099512961112',
  params: {
    invalid: 0,
    error: '',
    delay: 540,
    difficulty: 3,
    ease: 150,
    luck: 25,
    commission: 0,
  },
  rand1: 1.1764705882352942,
  rand2: 1.9058518348973832,
  rand3: 10.349019607843136,
  template_id: 19558,
  block_num: Long.fromBigInt(124900087n),
  block_timestamp: new Date('2022-02-17T01:05:38.000Z'),
  global_sequence: Long.fromBigInt(8775201844n),
  template_data: {
    cardid: 7,
    name: 'Standard Capacitor',
    img: 'QmaFe19mBfZWn2tvEN7Ea8xjdirnQQRisUGGBzBPb',
    backimg: 'QmaUNXHee4vPCC3vpGTr77tJvBHjh1ndUm4J7o4tP',
    rarity: 'Abundant',
    shine: 'Stone',
    type: 'Manipulator',
    delay: 75,
    difficulty: 1,
    ease: 10,
    luck: 5,
    movecost: 20,
  },
};

const sampleAtomicTransferDocument: AtomicTransferDocument = {
  type: 'grass',
  from: 'foo.from',
  to: 'bar.to',
  asset_ids: [0n].map(id => Long.fromBigInt(id)),
  block_num: Long.fromBigInt(0n),
  block_timestamp: new Date('2022-02-17T01:05:38.000Z'),
  global_sequence: Long.fromBigInt(1n),
};

const createEntityFromActionUseCaseMock = { execute: jest.fn() };
const nftRepositoryMock = { add: jest.fn() };
const atomicTransferRepositoryMock = { add: jest.fn() };
const mineRepositoryMock = { insertOne: jest.fn() };
const actionProcessingQueueServiceMock = {
  ackJob: jest.fn(),
  rejectJob: jest.fn(),
};
const queueAssetProcessingUseCaseMock = { execute: jest.fn() };

let container: Container;
let useCase: ProcessActionUseCase;

describe('ProcessActionUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<CreateEntityFromActionUseCase>(CreateEntityFromActionUseCase.Token)
      .toConstantValue(createEntityFromActionUseCaseMock as any);
    container
      .bind<NftRepository>(NftRepository.Token)
      .toConstantValue(nftRepositoryMock as any);
    container
      .bind<AtomicTransferRepository>(AtomicTransferRepository.Token)
      .toConstantValue(atomicTransferRepositoryMock as any);
    container
      .bind<MineRepository>(MineRepository.Token)
      .toConstantValue(mineRepositoryMock as any);
    container
      .bind<ActionProcessingQueueService>(ActionProcessingQueueService.Token)
      .toConstantValue(actionProcessingQueueServiceMock as any);
    container
      .bind<QueueAssetProcessingUseCase>(QueueAssetProcessingUseCase.Token)
      .toConstantValue(queueAssetProcessingUseCaseMock as any);
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

  it('Should ack action processing job when entity creation failed with "CollectionMismatchError" or "UnknownActionTypeError"', async () => {
    createEntityFromActionUseCaseMock.execute.mockImplementation(() =>
      Result.withFailure(
        Failure.fromError(new CollectionMismatchError('foo', 'bar'))
      )
    );
    const job = {};
    const result = await useCase.execute(job as any);

    expect(createEntityFromActionUseCaseMock.execute).toBeCalled();
    expect(result.failure.error).toBeInstanceOf(CollectionMismatchError);
    expect(actionProcessingQueueServiceMock.ackJob).toBeCalledWith(job);
  });

  it('Should reject action processing job when entity creation failed with error other than "CollectionMismatchError" and "UnknownActionTypeError"', async () => {
    createEntityFromActionUseCaseMock.execute.mockImplementation(() =>
      Result.withFailure(Failure.fromError(new Error('some error')))
    );
    const job = {};
    const result = await useCase.execute(job as any);

    expect(createEntityFromActionUseCaseMock.execute).toBeCalled();
    expect(result.failure.error).toBeInstanceOf(Error);
    expect(actionProcessingQueueServiceMock.rejectJob).toBeCalledWith(job);
  });

  it('Should upload Mine when created entity is an instance of Mine', async () => {
    const entity = Mine.fromDto(sampleMineDocument);
    const uploadMineMock = jest
      .spyOn(useCase as any, 'uploadMine')
      .mockImplementation();
    const job = {};

    createEntityFromActionUseCaseMock.execute.mockImplementation(() =>
      Result.withContent(entity)
    );

    await useCase.execute(job as any);

    expect(uploadMineMock).toBeCalledWith(entity, job);

    uploadMineMock.mockClear();
  });

  it('Should upload NFT when created entity is an instance of NFT', async () => {
    const entity = NFT.fromDto(sampleNFTDocument);
    const uploadNftMock = jest
      .spyOn(useCase as any, 'uploadNft')
      .mockImplementation();
    const job = {};

    createEntityFromActionUseCaseMock.execute.mockImplementation(() =>
      Result.withContent(entity)
    );

    await useCase.execute(job as any);

    expect(uploadNftMock).toBeCalledWith(entity, job);

    uploadNftMock.mockClear();
  });

  it('Should upload AtomicTransfer when created entity is an instance of AtomicTransfer', async () => {
    const entity = AtomicTransfer.fromDto(sampleAtomicTransferDocument);
    const uploadAtomicTransfer = jest
      .spyOn(useCase as any, 'uploadAtomicTransfer')
      .mockImplementation();
    const job = {};

    createEntityFromActionUseCaseMock.execute.mockImplementation(() =>
      Result.withContent(entity)
    );

    await useCase.execute(job as any);

    expect(uploadAtomicTransfer).toBeCalledWith(entity, job);

    uploadAtomicTransfer.mockClear();
  });

  it('Should ack job and return failure with UnhandledEntityError when created entity is unknown type', async () => {
    const job = {};

    createEntityFromActionUseCaseMock.execute.mockImplementation(() =>
      Result.withContent({})
    );

    const result = await useCase.execute(job as any);

    expect(actionProcessingQueueServiceMock.ackJob).toBeCalledWith(job);
    expect(result.failure.error).toBeInstanceOf(UnhandledEntityError);
  });

  it('"uploadMine" should ack job and return failure when inserting entity to the datatbase failed due to duplication error', async () => {
    const job = {};
    const error = InsertError.create<Mine>(
      {} as any,
      OperationErrorType.Duplicate,
      new Error()
    );
    mineRepositoryMock.insertOne.mockImplementation(() =>
      Result.withFailure(Failure.fromError(error))
    );

    const result = await (useCase as any).uploadMine({} as any, job);

    expect(actionProcessingQueueServiceMock.ackJob).toBeCalledWith(job);
    expect(result.failure.error.type).toEqual(OperationErrorType.Duplicate);
  });

  it('"uploadMine" should reject job and return failure when inserting entity to the datatbase failed for other reason than duplicated data', async () => {
    const job = {};
    const error = InsertError.create<Mine>(
      {} as any,
      OperationErrorType.Other,
      new Error()
    );
    mineRepositoryMock.insertOne.mockImplementation(() =>
      Result.withFailure(Failure.fromError(error))
    );

    const result = await (useCase as any).uploadMine({} as any, job);

    expect(actionProcessingQueueServiceMock.rejectJob).toBeCalledWith(job);
    expect(result.failure.error.type).toEqual(OperationErrorType.Other);
  });

  it('"uploadMine" should ack job and return empty result after successfully inserting the entity', async () => {
    const job = {};
    mineRepositoryMock.insertOne.mockImplementation(() =>
      Result.withContent({})
    );

    const result = await (useCase as any).uploadMine({} as any, job);

    expect(actionProcessingQueueServiceMock.ackJob).toBeCalledWith(job);
    expect(result.failure).toBeUndefined();
    expect(result.content).toBeUndefined();
  });

  it('"uploadNft" should ack job and return empty result when inserting entity to the datatbase failed due to duplication error', async () => {
    (DataSourceOperationError as any).getTypeByErrorMessage = () =>
      OperationErrorType.Duplicate;

    const job = {};
    const error = DataSourceOperationError.fromError(new Error());
    nftRepositoryMock.add.mockImplementation(() =>
      Result.withFailure(Failure.fromError(error))
    );

    const result = await (useCase as any).uploadNft({} as any, job);

    expect(actionProcessingQueueServiceMock.ackJob).toBeCalledWith(job);
    expect(result.failure).toBeUndefined();
  });

  it('"uploadNft" should reject job and return failure when inserting entity to the datatbase failed for other reason than duplicated data', async () => {
    (DataSourceOperationError as any).getTypeByErrorMessage = () =>
      OperationErrorType.Other;

    const job = {};
    const error = DataSourceOperationError.fromError(new Error());
    nftRepositoryMock.add.mockImplementation(() =>
      Result.withFailure(Failure.fromError(error))
    );

    const result = await (useCase as any).uploadNft({} as any, job);

    expect(actionProcessingQueueServiceMock.rejectJob).toBeCalledWith(job);
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"uploadAtomicTransfer" should ack job and return failure when inserting entity to the datatbase failed due to duplication error', async () => {
    (DataSourceOperationError as any).getTypeByErrorMessage = () =>
      OperationErrorType.Duplicate;

    const job = {};
    const error = DataSourceOperationError.fromError(new Error());
    atomicTransferRepositoryMock.add.mockImplementation(() =>
      Result.withFailure(Failure.fromError(error))
    );

    const result = await (useCase as any).uploadAtomicTransfer({} as any, job);

    expect(actionProcessingQueueServiceMock.ackJob).toBeCalledWith(job);
    expect(result.failure.error.type).toEqual(OperationErrorType.Duplicate);
  });

  it('"uploadAtomicTransfer" should reject job and return failure when inserting entity to the datatbase failed for other reason than duplicated data', async () => {
    (DataSourceOperationError as any).getTypeByErrorMessage = () =>
      OperationErrorType.Other;

    const job = {};
    const error = DataSourceOperationError.fromError(new Error());
    atomicTransferRepositoryMock.add.mockImplementation(() =>
      Result.withFailure(Failure.fromError(error))
    );

    const result = await (useCase as any).uploadAtomicTransfer({} as any, job);

    expect(actionProcessingQueueServiceMock.rejectJob).toBeCalledWith(job);
    expect(result.failure.error.type).toEqual(OperationErrorType.Other);
  });

  it('"uploadAtomicTransfer" should return failure when asset processing has not been queued', async () => {
    const job = {};
    atomicTransferRepositoryMock.add.mockImplementation(() =>
      Result.withContent({ assetsIds: [] })
    );
    queueAssetProcessingUseCaseMock.execute.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('FAIL'))
    );
    const result = await (useCase as any).uploadAtomicTransfer({} as any, job);

    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"uploadAtomicTransfer" should ack job when asset porcessing job has been queued', async () => {
    const job = {};
    atomicTransferRepositoryMock.add.mockImplementation(() =>
      Result.withContent({ assetsIds: [] })
    );
    queueAssetProcessingUseCaseMock.execute.mockImplementation(() =>
      Result.withoutContent()
    );
    const result = await (useCase as any).uploadAtomicTransfer({} as any, job);

    expect(actionProcessingQueueServiceMock.ackJob).toBeCalledWith(job);

    expect(result.failure).toBeUndefined();
    expect(result.content).toBeUndefined();
  });
});
