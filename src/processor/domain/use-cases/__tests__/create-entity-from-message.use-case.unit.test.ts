/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { CreateEntityFromActionUseCase } from '../create-entity-from-action.use-case';
import { Result } from '@core/architecture/domain/result';
import { Mine } from '@common/mines/domain/entities/mine';
import { TemplateSmartContractRepository } from '@common/smart-contracts/domain/repositories/template-smart-contract.repository';
import { SchemaSmartContractRepository } from '@common/smart-contracts/domain/repositories/schema-smart-contract.repository';
import { MineMessageData } from '@common/mines/data/mines.dtos';
import { NftMessageData } from '@common/nfts/data/nfts.dtos';
import { NFT } from '@common/nfts/domain/entities/nft';
import { TemplateSmartContractData } from '@common/smart-contracts/domain/entities/template-smart-contract-data';
import { SchemaSmartContractData } from '@common/smart-contracts/domain/entities/schema-smart-contract-data';
import { deserialize, ObjectSchema } from 'atomicassets';
import { Failure } from '@core/architecture/domain/failure';
import { AtomicTransfer } from '@common/atomic-transfers/domain/entities/atomic-transfer';
import { config } from '@config';
import { DeserializeActionJobUseCase } from '../deserialize-action-job.use-case';

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
const templateSmartContractRepositoryMock = {
  getData: jest.fn(),
} as any;
const schemaSmartContractRepositoryMock = {
  getData: jest.fn(),
} as any;

let container: Container;
let useCase: CreateEntityFromActionUseCase;

describe('GetBlocksRangeUseCase Unit tests', () => {
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
      .bind<CreateEntityFromActionUseCase>(CreateEntityFromActionUseCase.Token)
      .to(CreateEntityFromActionUseCase);
  });

  beforeEach(() => {
    useCase = container.get<CreateEntityFromActionUseCase>(
      CreateEntityFromActionUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(CreateEntityFromActionUseCase.Token).not.toBeNull();
  });

  it('"createMineEntity" should return Mine entity based on collected data', async () => {
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
      params: {
        invalid: 0,
        error: '',
        delay: 0,
        difficulty: 0,
        ease: 0,
        luck: 0,
        commission: 0,
      },
      bounty: '8310',
      land_id: 'land.001',
      planet_name: 'planet.foo',
      land_owner: 'foo.owner',
      bag_items: ['0'],
      offset: 0,
    };
    const executeMock = jest
      .spyOn(deserializeActionJobUseCaseMock, 'execute')
      .mockReturnValue(
        Result.withContent<MineMessageData>(deserializedData as any)
      );
    // @ts-ignore
    const result = useCase.createMineEntity(message);
    expect(executeMock).toBeCalledTimes(1);
    expect(result.content).toEqual(
      Mine.fromMessage(message as any, deserializedData)
    );

    executeMock.mockClear();
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

  it('Should trigger "createMineEntity" when action label is "m.federation::logmine"', async () => {
    const createMineEntityMock = jest.spyOn(useCase as any, 'createMineEntity');

    await useCase.execute({
      account: 'm.federation',
      name: 'logmine',
    } as any);
    expect(createMineEntityMock).toBeCalled();

    createMineEntityMock.mockClear();
  });

  it('Should trigger "createNftEntity" when action label is "m.federation::logrand"', async () => {
    const createNftEntityMock = jest.spyOn(useCase as any, 'createNftEntity');

    await useCase.execute({
      account: 'm.federation',
      name: 'logrand',
    } as any);
    expect(createNftEntityMock).toBeCalled();

    createNftEntityMock.mockClear();
  });

  it('Should trigger "createAtomicTransferEntity" when action label is "m.federation::logtransfer/logmint/logburn"', async () => {
    configMock.atomicAssets.contract = 'foo.contract';

    const createAtomicTransferEntityMock = jest.spyOn(
      useCase as any,
      'createAtomicTransferEntity'
    );

    await useCase.execute({
      account: configMock.atomicAssets.contract,
      name: 'logtransfer',
    } as any);
    await useCase.execute({
      account: configMock.atomicAssets.contract,
      name: 'logmint',
    } as any);
    await useCase.execute({
      account: configMock.atomicAssets.contract,
      name: 'logburn',
    } as any);

    expect(createAtomicTransferEntityMock).toBeCalledTimes(3);

    createAtomicTransferEntityMock.mockClear();
  });

  it('Should return failure when action label is unknown', async () => {
    const result = await useCase.execute({
      account: 'foo',
      name: 'logsomething',
    } as any);

    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });
});
