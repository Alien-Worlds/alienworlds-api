/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { AbiHexRepository } from '../../abi-hex.repository';
import { LoadAbiHexValuesUseCase } from '../load-abi-hex-values.use-case';

const abiRepository = {
  load: jest.fn(),
};

let container: Container;
let useCase: LoadAbiHexValuesUseCase;

describe('LoadAbiHexValuesUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<AbiHexRepository>(AbiHexRepository.Token)
      .toConstantValue(abiRepository as any);
    container
      .bind<LoadAbiHexValuesUseCase>(LoadAbiHexValuesUseCase.Token)
      .to(LoadAbiHexValuesUseCase);
  });

  beforeEach(() => {
    useCase = container.get<LoadAbiHexValuesUseCase>(
      LoadAbiHexValuesUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(LoadAbiHexValuesUseCase.Token).not.toBeNull();
  });

  it('Should call repository.load and return its result object', async () => {
    abiRepository.load.mockImplementation(() => Result.withContent([]));

    const result = await useCase.execute();

    expect(result).toEqual(Result.withContent([]));
    expect(abiRepository.load).toBeCalled();
  });
});
