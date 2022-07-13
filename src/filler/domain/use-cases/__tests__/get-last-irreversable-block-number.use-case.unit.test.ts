/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { GetLastIrreversableBlockNumUseCase } from '../get-last-irreversable-block-number.use-case';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { Failure } from '@core/architecture/domain/failure';
import { EosDacService } from '@common/eos-dac/domain/eos-dac.service';
import { LastIrreversableBlockNotFoundError } from '../../../domain/errors/last-irreversable-block-not-found.error';

const eosDacServiceMock = { getInfo: jest.fn() };
let container: Container;
let useCase: GetLastIrreversableBlockNumUseCase;

describe('GetLastIrreversableBlockNumUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<EosDacService>(EosDacService.Token)
      .toConstantValue(eosDacServiceMock as any);
    container
      .bind<GetLastIrreversableBlockNumUseCase>(
        GetLastIrreversableBlockNumUseCase.Token
      )
      .to(GetLastIrreversableBlockNumUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetLastIrreversableBlockNumUseCase>(
      GetLastIrreversableBlockNumUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetLastIrreversableBlockNumUseCase.Token).not.toBeNull();
  });

  it('Should return failure on any error ', async () => {
    eosDacServiceMock.getInfo.mockResolvedValue(
      Result.withFailure(Failure.withMessage('something went wrong'))
    );

    const result = await useCase.execute();

    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('Should return a failure with LastIrreversableBlockNotFoundError when last irreversable block was not found', async () => {
    eosDacServiceMock.getInfo.mockResolvedValue(Result.withContent({}));

    const result = await useCase.execute();

    expect(result.failure.error).toBeInstanceOf(
      LastIrreversableBlockNotFoundError
    );
  });

  it('Should return number of the last irreversable block', async () => {
    eosDacServiceMock.getInfo.mockResolvedValue(
      Result.withContent({ lastIrreversibleBlockNum: 1n })
    );

    const result = await useCase.execute();

    expect(result.content).toEqual(1n);
    expect(result.failure).toBeUndefined();
  });
});
