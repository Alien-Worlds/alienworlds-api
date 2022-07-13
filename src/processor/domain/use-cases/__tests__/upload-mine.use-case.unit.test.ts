/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { Mine } from '@common/mines/domain/entities/mine';
import { TemplateSmartContractRepository } from '@common/smart-contracts/domain/repositories/template-smart-contract.repository';
import { SchemaSmartContractRepository } from '@common/smart-contracts/domain/repositories/schema-smart-contract.repository';
import { MineDocument, MineMessageData } from '@common/mines/data/mines.dtos';
import { NftMessageData } from '@common/nfts/data/nfts.dtos';
import { NFT } from '@common/nfts/domain/entities/nft';
import { TemplateSmartContractData } from '@common/smart-contracts/domain/entities/template-smart-contract-data';
import { SchemaSmartContractData } from '@common/smart-contracts/domain/entities/schema-smart-contract-data';
import { deserialize, ObjectSchema } from 'atomicassets';
import { Failure } from '@core/architecture/domain/failure';
import { AtomicTransfer } from '@common/atomic-transfers/domain/entities/atomic-transfer';
import { config } from '@config';
import { DeserializeActionJobUseCase } from '../deserialize-action-job.use-case';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { MineRepository } from '@common/mines/domain/mine.repository';
import { UploadMineUseCase } from '../upload-mine.use-case';
import { OperationErrorType } from '@core/architecture/data/errors/data-source-operation.error';
import { InsertError } from '@common/mines/domain/errors/insert.error';

jest.mock('@config');
const configMock = config as jest.MockedObject<typeof config>;

jest.mock('atomicassets');
const ObjectSchemaMock = ObjectSchema as jest.MockedFunction<
  typeof ObjectSchema
>;
const deserializeMock = deserialize as jest.MockedFunction<typeof deserialize>;

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

const deserializeActionJobUseCaseMock = {
  execute: jest.fn(),
} as any;
const actionProcessingQueueServiceMock = {
  ackJob: jest.fn(),
  rejectJob: jest.fn(),
};
const mineRepositoryMock = { insertOne: jest.fn() };

let container: Container;
let useCase: UploadMineUseCase;

describe('UploadMineUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<DeserializeActionJobUseCase>(DeserializeActionJobUseCase.Token)
      .toConstantValue(deserializeActionJobUseCaseMock);
    container
      .bind<ActionProcessingQueueService>(ActionProcessingQueueService.Token)
      .toConstantValue(actionProcessingQueueServiceMock as any);
    container
      .bind<MineRepository>(MineRepository.Token)
      .toConstantValue(mineRepositoryMock as any);
    container
      .bind<UploadMineUseCase>(UploadMineUseCase.Token)
      .to(UploadMineUseCase);
  });

  beforeEach(() => {
    useCase = container.get<UploadMineUseCase>(UploadMineUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(UploadMineUseCase.Token).not.toBeNull();
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

  it('"createMineEntity" should return failure when deserialization fails', async () => {
    const message = {
      account: 'foo',
      name: 'bar',
      data: '',
      blockNumber: 0n,
      blockTimestamp: new Date(''),
      globalSequence: 0n,
      transactionId: 'trx-id-01',
    };
    const executeMock = jest
      .spyOn(deserializeActionJobUseCaseMock, 'execute')
      .mockReturnValue(Result.withFailure(Failure.withMessage('FAIL')));
    // @ts-ignore
    const result = useCase.createMineEntity(message);
    expect(result.failure).toBeInstanceOf(Failure);

    executeMock.mockClear();
  });

  it('Should trigger "createMineEntity"', async () => {
    const createMineEntityMock = jest
      .spyOn(useCase as any, 'createMineEntity')
      .mockResolvedValue(Result.withContent({}));
    mineRepositoryMock.insertOne.mockResolvedValue(Result.withContent({}));
    await useCase.execute({
      account: 'm.federation',
      name: 'logmine',
    } as any);

    expect(createMineEntityMock).toBeCalled();

    createMineEntityMock.mockClear();
  });

  it('Should return failure and reject job when entity creation fails', async () => {
    const createMineEntityMock = jest
      .spyOn(useCase as any, 'createMineEntity')
      .mockResolvedValue(Result.withFailure(Failure.withMessage('FAIL')));
    const result = await useCase.execute({
      account: 'm.federation',
      name: 'logmine',
    } as any);

    expect(result.failure).toBeInstanceOf(Failure);

    createMineEntityMock.mockClear();
  });

  it('Should upload Mine when created entity', async () => {
    const entity = Mine.fromDto(sampleMineDocument);
    const job = {};

    const createMineEntityMock = jest
      .spyOn(useCase as any, 'createMineEntity')
      .mockImplementation(() => Result.withContent(entity));

    await useCase.execute(job as any);

    expect(mineRepositoryMock.insertOne).toBeCalledWith(entity);

    createMineEntityMock.mockClear();
  });

  it('Should return failure and ack job when upload failed with DuplicateError', async () => {
    const entity = Mine.fromDto(sampleMineDocument);
    const job = {};
    const createMineEntityMock = jest
      .spyOn(useCase as any, 'createMineEntity')
      .mockImplementation(() => Result.withContent(entity));

    mineRepositoryMock.insertOne.mockResolvedValue(
      Result.withFailure(
        Failure.fromError(
          InsertError.create<Mine>(
            {} as any,
            OperationErrorType.Duplicate,
            new Error()
          )
        )
      )
    );
    const result = await useCase.execute(job as any);

    expect(result.failure).toBeInstanceOf(Failure);
    expect(actionProcessingQueueServiceMock.ackJob).toBeCalled();

    createMineEntityMock.mockClear();
  });

  it('Should return failure and reject job when upload failed with error', async () => {
    const entity = Mine.fromDto(sampleMineDocument);
    const job = {};
    const createMineEntityMock = jest
      .spyOn(useCase as any, 'createMineEntity')
      .mockImplementation(() => Result.withContent(entity));

    mineRepositoryMock.insertOne.mockResolvedValue(
      Result.withFailure(
        Failure.fromError(
          InsertError.create<Mine>(
            {} as any,
            OperationErrorType.Other,
            new Error()
          )
        )
      )
    );
    const result = await useCase.execute(job as any);

    expect(result.failure).toBeInstanceOf(Failure);
    expect(actionProcessingQueueServiceMock.rejectJob).toBeCalled();

    createMineEntityMock.mockClear();
  });
});
