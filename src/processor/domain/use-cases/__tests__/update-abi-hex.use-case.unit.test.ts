/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { UploadAbiHexUseCase } from '../upload-abi-hex.use-case';
import { AbiHexRepository } from '../../abi-hex.repository';

const abiRepository = {
  updateAbi: jest.fn(),
} as any;

let container: Container;
let useCase: UploadAbiHexUseCase;

describe('GetLastBlockUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<AbiHexRepository>(AbiHexRepository.Token)
      .toConstantValue(abiRepository);
    container
      .bind<UploadAbiHexUseCase>(UploadAbiHexUseCase.Token)
      .to(UploadAbiHexUseCase);
  });

  beforeEach(() => {
    useCase = container.get<UploadAbiHexUseCase>(UploadAbiHexUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(UploadAbiHexUseCase.Token).not.toBeNull();
  });

  it('Should call repository.updateAbi', async () => {
    abiRepository.updateAbi = () => Result.withoutContent();
    const { content, failure } = useCase.execute('foo', 'foo.abi');
    expect(content).toBeUndefined();
    expect(failure).toBeUndefined();
  });

  it('Should return a Failure object when mines repository returns a failure', async () => {
    abiRepository.updateAbi = () =>
      Result.withFailure(Failure.withMessage('fail'));

    const { content, failure } = await useCase.execute('foo', 'foo.abi');
    expect(content).toBeUndefined();
    expect(failure).toBeInstanceOf(Failure);
  });
});
