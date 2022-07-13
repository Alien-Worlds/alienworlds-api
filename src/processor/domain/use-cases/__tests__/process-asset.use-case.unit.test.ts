/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { AtomicTransferRepository } from '@common/atomic-transfers/domain/repositories/atomic-transfer.repository';
import { Failure } from '@core/architecture/domain/failure';
import { ProcessAssetUseCase } from '../process-asset.use-case';
import { AssetProcessingQueueService } from '@common/data-processing-queue/domain/services/asset-processing-queue.service';
import { AssetRepository } from '@common/assets/domain/repositories/asset.repository';
import { AssetSmartContractRepository } from '@common/smart-contracts/domain/repositories/asset-smart-contract.repository';
import { TemplateSmartContractRepository } from '@common/smart-contracts/domain/repositories/template-smart-contract.repository';
import { SchemaSmartContractRepository } from '@common/smart-contracts/domain/repositories/schema-smart-contract.repository';
import { Asset, AssetData } from '@common/assets/domain/entities/asset';
import { SmartContractDataNotFoundError } from '@common/smart-contracts/domain/errors/smart-contract-data-not-found.error';
import { Long } from 'mongodb';

const assetDataDto = {
  collection_name: 'foo.collection',
  template_id: 123456,
  schema_name: 'foo.schema',
  immutable_serialized_data: {
    cardid: 12,
    name: 'foo',
    img: 'foo.img',
    backimg: 'foo.backimg',
    rarity: 'rare',
    shine: 'stone',
    type: 'any',
    delay: 0,
    difficulty: 1,
    ease: 10,
    luck: 100,
  },
};

const assetDto = {
  asset_id: Long.fromBigInt(0n),
  owner: 'foo.owner',
  data: assetDataDto,
};

const assetProcessingQueueServiceMock = {
  ackJob: jest.fn(),
  rejectJob: jest.fn(),
};
const assetRepositoryMock = {
  add: jest.fn(),
  update: jest.fn(),
  getByAssetId: jest.fn(),
};
const atomicTransferRepositoryMock = { getByAssetId: jest.fn() };
const assetSmartContractRepositoryMock = { getData: jest.fn() };
const templateSmartContractRepositoryMock = {
  getData: jest.fn(),
};
const schemaSmartContractRepositoryMock = { getData: jest.fn() };

let container: Container;
let useCase: ProcessAssetUseCase;

describe('ProcessAssetUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<AssetProcessingQueueService>(AssetProcessingQueueService.Token)
      .toConstantValue(assetProcessingQueueServiceMock as any);
    container
      .bind<AssetRepository>(AssetRepository.Token)
      .toConstantValue(assetRepositoryMock as any);
    container
      .bind<AtomicTransferRepository>(AtomicTransferRepository.Token)
      .toConstantValue(atomicTransferRepositoryMock as any);
    container
      .bind<AssetSmartContractRepository>(AssetSmartContractRepository.Token)
      .toConstantValue(assetSmartContractRepositoryMock as any);
    container
      .bind<TemplateSmartContractRepository>(
        TemplateSmartContractRepository.Token
      )
      .toConstantValue(templateSmartContractRepositoryMock as any);
    container
      .bind<SchemaSmartContractRepository>(SchemaSmartContractRepository.Token)
      .toConstantValue(schemaSmartContractRepositoryMock as any);
    container
      .bind<ProcessAssetUseCase>(ProcessAssetUseCase.Token)
      .to(ProcessAssetUseCase);
  });

  beforeEach(() => {
    useCase = container.get<ProcessAssetUseCase>(ProcessAssetUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(ProcessAssetUseCase.Token).not.toBeNull();
  });

  it('Should return failure when retrieving transfer by assetId has failed', async () => {
    atomicTransferRepositoryMock.getByAssetId.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('Fail'))
    );
    const job = { assetId: 0n };
    const result = await useCase.execute(job as any);

    expect(atomicTransferRepositoryMock.getByAssetId).toBeCalled();
    expect(assetProcessingQueueServiceMock.rejectJob).toBeCalled();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('Should try to create asset when retrieving asset by assetId has failed', async () => {
    atomicTransferRepositoryMock.getByAssetId.mockImplementation(() =>
      Result.withContent({ to: 'foo.to' })
    );
    assetRepositoryMock.getByAssetId.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('Fail'))
    );

    const createAssetFromSmartContractsDataMock = jest
      .spyOn(useCase as any, 'createAssetFromSmartContractsData')
      .mockImplementation(() =>
        Result.withFailure(Failure.withMessage('Fail again'))
      );

    const job = { assetId: 0n };
    await useCase.execute(job as any);

    expect(createAssetFromSmartContractsDataMock).toBeCalled();

    createAssetFromSmartContractsDataMock.mockClear();
  });

  it('Should return failure and ack job when creating asset has failed due to missing smart contract data', async () => {
    atomicTransferRepositoryMock.getByAssetId.mockImplementation(() =>
      Result.withContent({ to: 'foo.to' })
    );
    assetRepositoryMock.getByAssetId.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('Fail'))
    );

    const createAssetFromSmartContractsDataMock = jest
      .spyOn(useCase as any, 'createAssetFromSmartContractsData')
      .mockImplementation(() =>
        Result.withFailure(
          Failure.fromError(new SmartContractDataNotFoundError('foo', 'bar'))
        )
      );

    const job = { assetId: 0n };
    const result = await useCase.execute(job as any);

    expect(result.failure.error).toBeInstanceOf(SmartContractDataNotFoundError);
    expect(assetProcessingQueueServiceMock.ackJob).toBeCalled();

    createAssetFromSmartContractsDataMock.mockClear();
  });

  it('Should return failure and reject job when creating asset has failed', async () => {
    atomicTransferRepositoryMock.getByAssetId.mockImplementation(() =>
      Result.withContent({ to: 'foo.to' })
    );
    assetRepositoryMock.getByAssetId.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('Fail'))
    );

    const createAssetFromSmartContractsDataMock = jest
      .spyOn(useCase as any, 'createAssetFromSmartContractsData')
      .mockImplementation(() =>
        Result.withFailure(Failure.withMessage('Other reason'))
      );

    const job = { assetId: 0n };
    const result = await useCase.execute(job as any);

    expect(result.failure.error).toBeInstanceOf(Error);
    expect(assetProcessingQueueServiceMock.rejectJob).toBeCalled();

    createAssetFromSmartContractsDataMock.mockClear();
  });

  it('Should add created asset to database and ack job after successfully creating the asset', async () => {
    atomicTransferRepositoryMock.getByAssetId.mockImplementation(() =>
      Result.withContent({ to: 'foo.to' })
    );
    assetRepositoryMock.getByAssetId.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('Fail'))
    );
    assetRepositoryMock.add.mockImplementation(() => ({}));

    const createAssetFromSmartContractsDataMock = jest
      .spyOn(useCase as any, 'createAssetFromSmartContractsData')
      .mockImplementation(() => Result.withContent({}));

    const job = { assetId: 0n };
    const result = await useCase.execute(job as any);

    expect(result.failure).toBeUndefined();
    expect(result.content).toBeUndefined();
    expect(assetRepositoryMock.add).toBeCalled();
    expect(assetProcessingQueueServiceMock.ackJob).toBeCalled();

    createAssetFromSmartContractsDataMock.mockClear();
  });

  it('Should ack job after successfully updating the asset', async () => {
    atomicTransferRepositoryMock.getByAssetId.mockImplementation(() =>
      Result.withContent({ to: 'foo.to' })
    );
    assetRepositoryMock.getByAssetId.mockImplementation(() =>
      Result.withContent({ toDto: () => assetDto })
    );
    assetRepositoryMock.update.mockImplementation(() => ({}));

    const job = { assetId: 0n };
    const result = await useCase.execute(job as any);

    expect(result.failure).toBeUndefined();
    expect(result.content).toBeUndefined();
    expect(assetRepositoryMock.update).toBeCalled();
    expect(assetProcessingQueueServiceMock.ackJob).toBeCalled();
  });

  it('Should return failure and reject message when updating the asset has failed', async () => {
    atomicTransferRepositoryMock.getByAssetId.mockImplementation(() =>
      Result.withContent({ to: 'foo.to' })
    );
    assetRepositoryMock.getByAssetId.mockImplementation(() =>
      Result.withContent({ toDto: () => assetDto })
    );
    assetRepositoryMock.update.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('Failure'))
    );

    const job = { assetId: 0n };
    const result = await useCase.execute(job as any);

    expect(result.failure).toBeInstanceOf(Failure);
    expect(result.content).toBeUndefined();
    expect(assetProcessingQueueServiceMock.rejectJob).toBeCalled();
  });

  it('"createAssetFromSmartContractsData" should return failure when retrieving asset smart contract data has failed', async () => {
    assetSmartContractRepositoryMock.getData.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('FAIL'))
    );
    const job = { assetId: 0n };
    const result = await (useCase as any).createAssetFromSmartContractsData(
      job as any
    );

    expect(assetSmartContractRepositoryMock.getData).toBeCalled();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"createAssetFromSmartContractsData" should return failure when retrieving template smart contract data has failed', async () => {
    assetSmartContractRepositoryMock.getData.mockImplementation(() =>
      Result.withContent({ collectionName: '', templateId: '' })
    );

    templateSmartContractRepositoryMock.getData.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('FAIL'))
    );
    const job = {};
    const result = await (useCase as any).createAssetFromSmartContractsData(
      job as any
    );

    expect(templateSmartContractRepositoryMock.getData).toBeCalled();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"createAssetFromSmartContractsData" should return failure when retrieving schema smart contract data has failed', async () => {
    assetSmartContractRepositoryMock.getData.mockImplementation(() =>
      Result.withContent({ collectionName: '', templateId: '' })
    );
    templateSmartContractRepositoryMock.getData.mockImplementation(() =>
      Result.withContent({ schemaName: '' })
    );

    schemaSmartContractRepositoryMock.getData.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('FAIL'))
    );
    const job = {};
    const result = await (useCase as any).createAssetFromSmartContractsData(
      job as any
    );

    expect(schemaSmartContractRepositoryMock.getData).toBeCalled();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"createAssetFromSmartContractsData" should return failure when retrieving schema smart contract data has failed', async () => {
    assetSmartContractRepositoryMock.getData.mockImplementation(() =>
      Result.withContent({ collectionName: '', templateId: '' })
    );
    templateSmartContractRepositoryMock.getData.mockImplementation(() =>
      Result.withContent({ schemaName: '' })
    );

    schemaSmartContractRepositoryMock.getData.mockImplementation(() =>
      Result.withContent({})
    );
    AssetData.fromDto = jest.fn().mockReturnValue({});
    AssetData.fromSmartContractsData = jest.fn();
    const asset = Asset.create(0n, '', {} as any);
    Asset.create = jest.fn().mockImplementation(() => asset);

    const job = {};
    const result = await (useCase as any).createAssetFromSmartContractsData(
      job as any
    );

    expect(AssetData.fromSmartContractsData).toBeCalled();
    expect(Asset.create).toBeCalled();
    expect(result.failure).toBeUndefined();
    expect(result.content).toBeInstanceOf(Asset);
  });
});
