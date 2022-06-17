/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { MineRepositoryImpl } from '@common/mines/data/mine.repository-impl';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { Mine } from '../../entities/mine';
import { MineRepository } from '../../mine.repository';
import { GetLastBlockUseCase } from '../get-last-block.use-case';

jest.mock('@common/mines/data/mine.repository-impl');

const minesRepositoryImplMock = new MineRepositoryImpl(null);
let container: Container;
let useCase: GetLastBlockUseCase;
let getLastBlockMock;

describe('GetLastBlockUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<MineRepository>(MineRepository.Token)
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
      Result.withContent(
        Mine.fromDto({
          _id: 'fakeMiner',
          block_num: 0,
          global_sequence: 0,
        } as any)
      )
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
