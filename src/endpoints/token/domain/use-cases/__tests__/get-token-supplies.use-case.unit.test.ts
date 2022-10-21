/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from '@alien-worlds/api-core';
import { GetTokenSuppliesUseCase } from '../get-token-supplies.use-case';
import { Result } from '@alien-worlds/api-core';
import { CurrencyStats } from '../../entities/currecy-stats';
import { EosDacService } from '../../services/eos-dac.service';

const service = {
  getCurrencyStats: jest.fn(),
};

let container: Container;
let useCase: GetTokenSuppliesUseCase;

const currencyStats = CurrencyStats.fromDto({
  TLM: { supply: '10000', max_supply: '10000', issuer: 'fake' },
});

describe('GetTokenSuppliesUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<EosDacService>(EosDacService.Token)
      .toConstantValue(service as any);
    container
      .bind<GetTokenSuppliesUseCase>(GetTokenSuppliesUseCase.Token)
      .to(GetTokenSuppliesUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetTokenSuppliesUseCase>(
      GetTokenSuppliesUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetTokenSuppliesUseCase.Token).not.toBeNull();
  });

  it('Should call service.getCurrencyStats', async () => {
    service.getCurrencyStats.mockResolvedValue(
      Result.withContent(currencyStats)
    );
    await useCase.execute();

    expect(service.getCurrencyStats).toBeCalled();
  });
});
