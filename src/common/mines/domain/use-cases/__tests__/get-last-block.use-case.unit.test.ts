/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { MinesRepositoryImpl } from '@common/mines/data/mines.repository-impl';
import { Failure } from '@core/domain/failure';
import { Result } from '@core/domain/result';
import { Container } from 'inversify';
import { Mine } from '../../entities/mine';
import { MinesRepository } from '../../mines.repository';
import { GetLastBlockUseCase } from '../get-last-block.use-case';

jest.mock('@common/mines/data/mines.repository-impl');

const minesRepositoryImplMock = new MinesRepositoryImpl(null);
let container: Container;
let useCase: GetLastBlockUseCase;
let getLastBlockMock;

describe('GetLastBlockUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<MinesRepository>(MinesRepository.Token)
      .toConstantValue(minesRepositoryImplMock);
    container
      .bind<GetLastBlockUseCase>(GetLastBlockUseCase.Token)
      .to(GetLastBlockUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetLastBlockUseCase>(GetLastBlockUseCase.Token);
    getLastBlockMock = jest.spyOn(minesRepositoryImplMock, 'getLastBlock');
  });

  afterEach(() => {
    getLastBlockMock.mockReset();
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetLastBlockUseCase.Token).not.toBeNull();
  });

  it('Should return Mine object', async () => {
    getLastBlockMock.mockResolvedValue(
      Result.withContent(Mine.fromDto({ _id: 'fakeMiner' } as any))
    );

    const { content, failure } = await useCase.execute();
    expect(content).toBeInstanceOf(Mine);
    expect(failure).toBeUndefined();
  });

  it('Should return a Failure object when mines repository returns a failure', async () => {
    getLastBlockMock.mockResolvedValue(
      Result.withFailure(Failure.fromError(new Error('Some error')))
    );

    const { content, failure } = await useCase.execute();
    expect(content).toBeUndefined();
    expect(failure).toBeInstanceOf(Failure);
  });
});
