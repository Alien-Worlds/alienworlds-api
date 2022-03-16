/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Result } from '@core/domain/result';
import { Container } from 'inversify';
import { Failure } from '@core/domain/failure';
import { AbiRepositoryImpl } from '@common/abi/data/abi.repository-impl';
import { AbieosService } from '@common/abi/data/services/abieos.service';
import {
  DeserializeActionUseCase,
  DeserializeActionUseCaseParams,
} from '../deserialize-action.use-case';
import { AbiRepository } from '../../abi.repository';
import { MostRecentAbi } from '../../entities/most-recent-abi';

jest.mock('@common/abi/data/services/abieos.service');
jest.mock('@common/abi/data/abi.repository-impl');

const abieosService = new AbieosService();
const abieosServiceMock = abieosService as jest.MockedObject<AbieosService>;
const abiRepository = new AbiRepositoryImpl();
const abiRepositoryMock = abiRepository as jest.MockedObject<AbiRepositoryImpl>;
const params = DeserializeActionUseCaseParams.create(
  'foo.account',
  'foo',
  '',
  0n
);
let container: Container;
let useCase: DeserializeActionUseCase;

describe('GetBlocksRangeUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<AbiRepository>(AbiRepository.Token)
      .toConstantValue(abiRepository);
    container
      .bind<AbieosService>(AbieosService.Token)
      .toConstantValue(abieosService);
    container
      .bind<DeserializeActionUseCase>(DeserializeActionUseCase.Token)
      .to(DeserializeActionUseCase);
  });

  beforeEach(() => {
    useCase = container.get<DeserializeActionUseCase>(
      DeserializeActionUseCase.Token
    );
  });

  afterEach(() => {
    abieosServiceMock.getTypeForAction.mockReset();
    abieosServiceMock.parseDataToJson.mockReset();
    abiRepositoryMock.getMostRecentAbi.mockReset();
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(DeserializeActionUseCase.Token).not.toBeNull();
  });

  it('Should return Failure when getting most recent abi fails', async () => {
    abiRepositoryMock.getMostRecentAbi.mockReturnValue(
      Result.withFailure(Failure.withMessage('some error'))
    );

    const { content, failure } = await useCase.execute(params);

    expect(content).toBeUndefined();
    expect(failure).toBeInstanceOf(Failure);
  });

  it('Should return Failure when setting new abi hex fails', async () => {
    const dto = {
      contract: 'foo',
      block_num: '0',
      abi_hex: 'foo-abi-hex',
      filename: 'foo-12345.hex',
    };
    abiRepositoryMock.getMostRecentAbi.mockReturnValue(
      Result.withContent(MostRecentAbi.create(dto, true))
    );
    abieosServiceMock.loadAbiHex.mockImplementation(() => {
      throw new Error('some error');
    });

    const { content, failure } = await useCase.execute(params);

    expect(content).toBeUndefined();
    expect(failure).toBeInstanceOf(Failure);
  });

  it('Should return Result with json content', async () => {
    const dto = {
      contract: 'foo',
      block_num: '0',
      abi_hex: 'foo-abi-hex',
      filename: 'foo-12345.hex',
    };
    const json = 'json-value';

    abiRepositoryMock.getMostRecentAbi.mockReturnValue(
      Result.withContent(MostRecentAbi.create(dto, true))
    );
    abieosServiceMock.loadAbiHex.mockReturnValue();
    abieosServiceMock.getTypeForAction.mockReturnValue('foo-type');
    abieosServiceMock.parseDataToJson.mockReturnValue(json);

    const { content, failure } = await useCase.execute(params);

    expect(content).toEqual(json);
    expect(failure).toBeUndefined();
  });

  it('Should call the method "deserializeAction" a second time only for the current block when the first call fails', async () => {
    const deserializeActionMock = jest.spyOn(
      useCase as any,
      'deserializeAction'
    );

    deserializeActionMock
      .mockReturnValueOnce(
        Result.withFailure(Failure.withMessage('some error'))
      )
      .mockReturnValueOnce(Result.withContent('json'));

    await useCase.execute(params);

    expect(deserializeActionMock).toBeCalledTimes(2);

    deserializeActionMock.mockReset();
  });
});
