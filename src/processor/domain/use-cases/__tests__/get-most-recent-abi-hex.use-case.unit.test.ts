/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { AbiHexRepository } from '../../../domain/abi-hex.repository';
import { GetMostRecentAbiHexUseCase } from '../get-most-recent-abi-hex.use-case';

const abiRepository = {
  getMostRecentAbiHex: jest.fn(() => {}),
} as any;

const abiRepositoryMock = abiRepository as jest.MockedObject<AbiHexRepository>;

let container: Container;
let useCase: GetMostRecentAbiHexUseCase;

describe('GetLastBlockUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<AbiHexRepository>(AbiHexRepository.Token)
      .toConstantValue(abiRepository);
    container
      .bind<GetMostRecentAbiHexUseCase>(GetMostRecentAbiHexUseCase.Token)
      .to(GetMostRecentAbiHexUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetMostRecentAbiHexUseCase>(
      GetMostRecentAbiHexUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetMostRecentAbiHexUseCase.Token).not.toBeNull();
  });

  it('Should call repository.updateAbi', async () => {
    abiRepository.getMostRecentAbiHex = jest.fn(() => Result.withoutContent());
    const { content, failure } = useCase.execute('foo', 0n, false);

    expect(abiRepositoryMock.getMostRecentAbiHex).toBeCalledWith(
      'foo',
      0n,
      false
    );
    expect(content).toBeUndefined();
    expect(failure).toBeUndefined();
  });

  it('Should return a Failure object when mines repository returns a failure', async () => {
    abiRepository.getMostRecentAbiHex = jest.fn(() =>
      Result.withFailure(Failure.withMessage('fail'))
    );

    const { content, failure } = await useCase.execute('foo', 0n, false);
    expect(abiRepositoryMock.getMostRecentAbiHex).toBeCalledWith(
      'foo',
      0n,
      false
    );
    expect(content).toBeUndefined();
    expect(failure).toBeInstanceOf(Failure);
  });
});
