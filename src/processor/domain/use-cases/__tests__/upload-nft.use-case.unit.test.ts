/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { TemplateSmartContractRepository } from '@common/smart-contracts/domain/repositories/template-smart-contract.repository';
import { SchemaSmartContractRepository } from '@common/smart-contracts/domain/repositories/schema-smart-contract.repository';
import { NftMessageData } from '@common/nfts/data/nfts.dtos';
import { NFT } from '@common/nfts/domain/entities/nft';
import { TemplateSmartContractData } from '@common/smart-contracts/domain/entities/template-smart-contract-data';
import { SchemaSmartContractData } from '@common/smart-contracts/domain/entities/schema-smart-contract-data';
import { deserialize, ObjectSchema } from 'atomicassets';
import { Failure } from '@core/architecture/domain/failure';
import { DeserializeActionJobUseCase } from '../deserialize-action-job.use-case';
import { UploadNftUseCase } from '../upload-nft.use-case';
import {
  DataSourceOperationError,
  OperationErrorType,
} from '@core/architecture/data/errors/data-source-operation.error';
import { NftRepository } from '@common/nfts/domain/repositories/nft.repository';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';

jest.mock('@config');

jest.mock('atomicassets');
const ObjectSchemaMock = ObjectSchema as jest.MockedFunction<
  typeof ObjectSchema
>;
const deserializeMock = deserialize as jest.MockedFunction<typeof deserialize>;

const deserializeActionJobUseCaseMock = {
  execute: jest.fn(),
} as any;
const templateSmartContractRepositoryMock = {
  getData: jest.fn(),
} as any;
const schemaSmartContractRepositoryMock = {
  getData: jest.fn(),
} as any;
const actionProcessingQueueServiceMock = {
  ackJob: jest.fn(),
  rejectJob: jest.fn(),
};
const nftRepositoryMock = { add: jest.fn() };

let container: Container;
let useCase: UploadNftUseCase;

describe('UploadNft Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<DeserializeActionJobUseCase>(DeserializeActionJobUseCase.Token)
      .toConstantValue(deserializeActionJobUseCaseMock);
    container
      .bind<TemplateSmartContractRepository>(
        TemplateSmartContractRepository.Token
      )
      .toConstantValue(templateSmartContractRepositoryMock);
    container
      .bind<SchemaSmartContractRepository>(SchemaSmartContractRepository.Token)
      .toConstantValue(schemaSmartContractRepositoryMock);
    container
      .bind<NftRepository>(NftRepository.Token)
      .toConstantValue(nftRepositoryMock);
    container
      .bind<ActionProcessingQueueService>(ActionProcessingQueueService.Token)
      .toConstantValue(actionProcessingQueueServiceMock as any);
    container
      .bind<UploadNftUseCase>(UploadNftUseCase.Token)
      .to(UploadNftUseCase);
  });

  beforeEach(() => {
    useCase = container.get<UploadNftUseCase>(UploadNftUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(UploadNftUseCase.Token).not.toBeNull();
  });

  it('"createNftEntity" should return NFT entity with empty templateData based on collected data', async () => {
    const message = {
      account: 'foo',
      name: 'bar',
      data: '',
      blockNumber: 0n,
      blockTimestamp: new Date(''),
      globalSequence: 0n,
      transactionId: 'trx-id-01',
    };
    const deserializedData = {
      miner: 'foo.federation',
      land_id: 'foo.land',
      params: {
        invalid: 0,
        error: '',
        delay: 0,
        difficulty: 0,
        ease: 0,
        luck: 0,
        commission: 0,
      },
      rand1: 1,
      rand2: 2,
      rand3: 3,
      template_id: 0,
    };
    const executeMock = jest
      .spyOn(deserializeActionJobUseCaseMock, 'execute')
      .mockReturnValue(
        Result.withContent<NftMessageData>(deserializedData as any)
      );
    // @ts-ignore
    const result = await useCase.createNftEntity(message);
    expect(executeMock).toBeCalledTimes(1);
    expect(result.content).toEqual(
      NFT.fromMessage(message as any, deserializedData)
    );
    expect(result.content.templateData).toEqual({});

    executeMock.mockClear();
  });

  it('"createNftEntity" should return a failure when deserialization has failed', async () => {
    const executeMock = jest
      .spyOn(deserializeActionJobUseCaseMock, 'execute')
      .mockReturnValue(Result.withFailure(Failure.withMessage('some error')));
    // @ts-ignore
    const result = await useCase.createNftEntity({});
    expect(executeMock).toBeCalledTimes(1);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);

    executeMock.mockClear();
  });

  it('"createNftEntity" should return NFT entity with templateData based on collected data and when template_id > 0', async () => {
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
      miner: 'foo.federation',
      land_id: 'foo.land',
      params: {
        invalid: 0,
        error: '',
        delay: 0,
        difficulty: 0,
        ease: 0,
        luck: 0,
        commission: 0,
      },
      rand1: 1,
      rand2: 2,
      rand3: 3,
      template_id: 1,
    } as any;
    const templateContractData = {
      schemaName: 'schema.name',
      immutableSerializedData: [],
    } as any;
    const schemaContractData = {
      format: [
        {
          name: 'schema.format.name',
          type: 'schema.format.type',
        },
      ],
    } as any;
    ObjectSchemaMock.mockReturnValue({} as any);
    deserializeMock.mockReturnValue({} as any);
    const executeMock = jest
      .spyOn(deserializeActionJobUseCaseMock, 'execute')
      .mockReturnValue(Result.withContent<NftMessageData>(deserializedData));
    const getTemplateMock = jest
      .spyOn(templateSmartContractRepositoryMock, 'getData')
      .mockReturnValue(
        Result.withContent<TemplateSmartContractData>(templateContractData)
      );
    const getSchemaMock = jest
      .spyOn(schemaSmartContractRepositoryMock, 'getData')
      .mockReturnValue(
        Result.withContent<SchemaSmartContractData>(schemaContractData)
      );
    // @ts-ignore
    const result = await useCase.createNftEntity(message);
    expect(executeMock).toBeCalledTimes(1);
    expect(result.content).toEqual(
      NFT.fromMessage(
        message,
        deserializedData,
        templateContractData,
        schemaContractData
      )
    );
    expect(result.content.templateData).toEqual({});

    executeMock.mockClear();
    getTemplateMock.mockClear();
    getSchemaMock.mockClear();
    ObjectSchemaMock.mockClear();
    deserializeMock.mockClear();
  });

  it('"createNftEntity" should return a failure when deserialization has failed', async () => {
    const executeMock = jest
      .spyOn(deserializeActionJobUseCaseMock, 'execute')
      .mockReturnValue(Result.withFailure(Failure.withMessage('some error')));
    // @ts-ignore
    const result = await useCase.createNftEntity({});
    expect(executeMock).toBeCalledTimes(1);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);

    executeMock.mockClear();
  });

  it('"createNftEntity" should return a failure when the template smart contract data could not be received', async () => {
    const message = {
      account: 'foo',
      name: 'bar',
      data: '',
      blockNumber: 0n,
      blockTimestamp: new Date(''),
      globalSequence: 0n,
      transactionId: 'trx-id-01',
    } as any;

    const executeMock = jest
      .spyOn(deserializeActionJobUseCaseMock, 'execute')
      .mockReturnValue(
        Result.withContent<NftMessageData>({ template_id: 1 } as any)
      );
    const getTemplateMock = jest
      .spyOn(templateSmartContractRepositoryMock, 'getData')
      .mockReturnValue(Result.withFailure(Failure.withMessage('some error')));
    // @ts-ignore
    const result = await useCase.createNftEntity(message);
    expect(executeMock).toBeCalledTimes(1);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);

    executeMock.mockClear();
    getTemplateMock.mockClear();
    ObjectSchemaMock.mockClear();
    deserializeMock.mockClear();
  });

  it('"createNftEntity" should return a failure when the schema smart contract data could not be received', async () => {
    const message = {
      account: 'foo',
      name: 'bar',
      data: '',
      blockNumber: 0n,
      blockTimestamp: new Date(''),
      globalSequence: 0n,
      transactionId: 'trx-id-01',
    } as any;

    const executeMock = jest
      .spyOn(deserializeActionJobUseCaseMock, 'execute')
      .mockReturnValue(
        Result.withContent<NftMessageData>({ template_id: 1 } as any)
      );
    const getSchemaMock = jest
      .spyOn(schemaSmartContractRepositoryMock, 'getData')
      .mockReturnValue(Result.withFailure(Failure.withMessage('some error')));
    const getTemplateMock = jest
      .spyOn(templateSmartContractRepositoryMock, 'getData')
      .mockReturnValue(
        Result.withContent<TemplateSmartContractData>({} as any)
      );
    // @ts-ignore
    const result = await useCase.createNftEntity(message);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);

    executeMock.mockClear();
    getTemplateMock.mockClear();
    getSchemaMock.mockClear();
    ObjectSchemaMock.mockClear();
    deserializeMock.mockClear();
  });

  it('Should trigger "createNftEntity"', async () => {
    const createNftEntityMock = jest.spyOn(useCase as any, 'createNftEntity');

    await useCase.execute({
      account: 'm.federation',
      name: 'logrand',
    } as any);
    expect(createNftEntityMock).toBeCalled();

    createNftEntityMock.mockClear();
  });

  it('Should ack job and return empty result when inserting entity to the datatbase failed due to duplication error', async () => {
    (DataSourceOperationError as any).getTypeByErrorMessage = () =>
      OperationErrorType.Duplicate;

    const job = {};
    const error = DataSourceOperationError.fromError(new Error());
    const createNftEntityMock = jest
      .spyOn(useCase as any, 'createNftEntity')
      .mockResolvedValue(Result.withContent({}));
    nftRepositoryMock.add.mockImplementation(() =>
      Result.withFailure(Failure.fromError(error))
    );

    const result = await (useCase as any).execute({} as any, job);

    expect(actionProcessingQueueServiceMock.ackJob).toBeCalledWith(job);
    expect(result.failure).toBeUndefined();

    createNftEntityMock.mockClear();
    nftRepositoryMock.add.mockClear();
  });

  it('Should reject job and return failure when inserting entity to the datatbase failed for other reason than duplicated data', async () => {
    const job = {};
    nftRepositoryMock.add.mockImplementation(() =>
      Result.withFailure(Failure.fromError(new Error()))
    );

    const result = await (useCase as any).execute({} as any, job);

    expect(actionProcessingQueueServiceMock.rejectJob).toBeCalledWith(job);
    expect(result.failure).toBeInstanceOf(Failure);
  });
});
