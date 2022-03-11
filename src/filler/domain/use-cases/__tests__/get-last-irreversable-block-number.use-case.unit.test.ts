/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { GetLastIrreversableBlockNumUseCase } from '../get-last-irreversable-block-number.use-case';
import { Result } from '../../../../core/domain/result';
import { Container } from 'inversify';
import { Failure } from '@core/domain/failure';
import { EosDacRepository } from '@common/eos-dac/domain/eos-dac.repository';
import { EosDacRepositoryImpl } from '@common/eos-dac/data/eos-dac.repository-impl';

jest.mock('@common/eos-dac/data/eos-dac.service');
jest.mock('@common/eos-dac/domain/eos-dac.repository');

let container: Container;
let useCase: GetLastIrreversableBlockNumUseCase;

describe('GetLastIrreversableBlockNumUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<EosDacRepository>(EosDacRepository.Token)
      .toConstantValue(new EosDacRepositoryImpl(null));
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

  it('Should return Result object with the number', async () => {
    const lastIrreversibleBlockNum = 1111;
    jest
      .spyOn(EosDacRepositoryImpl.prototype, 'getInfo')
      .mockResolvedValue(Result.withContent<any>({ lastIrreversibleBlockNum }));

    const result = await useCase.execute();
    expect(result.content).toEqual(lastIrreversibleBlockNum);
  });

  it('Should return Failure when EosDacRepository.getInfo fails', async () => {
    jest
      .spyOn(EosDacRepositoryImpl.prototype, 'getInfo')
      .mockResolvedValue(Result.withFailure(Failure.withMessage('failed')));

    const result = await useCase.execute();
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
    expect(result.failure.error.message).toEqual('failed');
  });
});
