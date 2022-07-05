/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Failure } from '@core/architecture/domain/failure';
import { Container } from 'inversify';
import { AbiRepository } from '../../abi.repository';
import { AbiRepositoryImpl } from '@common/abi/data/repositories/abi.repository-impl';
import { GetCurrentAbiUseCase } from '../get-current-abi.use-case';
import { Abi } from '../../entities/abi';
import { Result } from '@core/architecture/domain/result';

jest.mock('eosjs/dist/eosjs-serialize');

const typeDto = {
  new_type_name: 'some_name',
  type: 'some_type',
};

const variantDto = {
  name: 'SOME_NAME',
  types: ['TYPE_1', 'TYPE_2'],
};

const structDto = {
  name: 'foo.name',
  base: 'FOO',
  fields: [{ name: 'FIELD_NAME', type: 'FIELD_TYPE' }],
};

const ricardianClauseDto = {
  id: 'SOME_ID',
  body: 'SOME_BODY',
};

const abiExtensionDto = {
  tag: 12345,
  value: 'SOME_BODY',
};

const errorMessageDto = {
  error_code: '200',
  error_msg: 'SOME_MESSAGE',
};

const tableDto = {
  name: 'accounts',
  type: 'account',
  index_type: 'i64',
  key_names: ['KEY_NAME_1'],
  key_types: ['KEY_TYPE_1'],
};

const actionDto = {
  name: 'create',
  type: 'create',
  ricardian_contract: 'contract',
};

const abiDto = {
  version: 'version_1',
  types: [typeDto],
  structs: [structDto],
  tables: [tableDto],
  actions: [actionDto],
  ricardian_clauses: [ricardianClauseDto],
  abi_extensions: [abiExtensionDto],
  error_messages: [errorMessageDto],
  variants: [variantDto],
};

const abiRepository = {
  getCurrentAbi: jest.fn(() => {}),
} as any;

const abiRepositoryMock = abiRepository as jest.MockedObject<AbiRepositoryImpl>;

let container: Container;
let useCase: GetCurrentAbiUseCase;

describe('GetCurrentAbiUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<AbiRepository>(AbiRepository.Token)
      .toConstantValue(abiRepository);
    container
      .bind<GetCurrentAbiUseCase>(GetCurrentAbiUseCase.Token)
      .to(GetCurrentAbiUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetCurrentAbiUseCase>(GetCurrentAbiUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetCurrentAbiUseCase.Token).not.toBeNull();
  });

  it('Should call AbieosService methods and return JSON', async () => {
    const abi = Abi.fromDto(abiDto);
    abiRepository.getCurrentAbi = jest.fn(() => Result.withContent(abi));

    const { content, failure } = useCase.execute();

    expect(abiRepositoryMock.getCurrentAbi).toBeCalled();
    expect(content).toBeInstanceOf(Abi);
    expect(failure).toBeUndefined();
  });

  it('Should return a failure ', async () => {
    abiRepository.getCurrentAbi = jest.fn(() =>
      Result.withFailure(Failure.fromError(new Error()))
    );

    const { content, failure } = useCase.execute();

    expect(content).toBeUndefined();
    expect(failure).toBeInstanceOf(Failure);
  });
});
