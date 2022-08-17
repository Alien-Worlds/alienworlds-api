/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { EosDacService } from '@common/eos-dac/domain/eos-dac.service';
import { EthContractService } from '../../services/eth-contract.service';
import { BscContractService } from '../../services/bsc-contract.service';
import { GetCirculatingSupplyUseCase } from '../get-circulating-supply.use-case';
import { Result } from '@core/architecture/domain/result';
import { Failure } from '@core/architecture/domain/failure';
import { CurrencyStats } from '@common/eos-dac/domain/entities/currecy-stats';

const service = {
  getCurrencyStats: jest.fn(),
  getCurrencyBalance: jest.fn(),
};
const ethService = {
  getBalance: jest.fn(),
};
const bscService = {
  getBalance: jest.fn(),
};

let container: Container;
let useCase: GetCirculatingSupplyUseCase;

const currencyStats = CurrencyStats.fromDto({
  TLM: { supply: '10000', max_supply: '10000', issuer: 'fake' },
});

describe('GetCirculatingSupplyUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<EosDacService>(EosDacService.Token)
      .toConstantValue(service as any);
    container
      .bind<EthContractService>(EthContractService.Token)
      .toConstantValue(ethService as any);
    container
      .bind<BscContractService>(BscContractService.Token)
      .toConstantValue(bscService as any);
    container
      .bind<GetCirculatingSupplyUseCase>(GetCirculatingSupplyUseCase.Token)
      .to(GetCirculatingSupplyUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetCirculatingSupplyUseCase>(
      GetCirculatingSupplyUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetCirculatingSupplyUseCase.Token).not.toBeNull();
  });

  it('Should result with failure when getCurrencyStats fails', async () => {
    service.getCurrencyStats.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute();
    expect(result.isFailure).toBeTruthy();
  });

  it('Should result with failure when eosDacService.getCurrencyBalance fails', async () => {
    service.getCurrencyStats.mockImplementation(() =>
      Result.withContent(currencyStats)
    );
    service.getCurrencyBalance.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute();
    expect(result.isFailure).toBeTruthy();
  });

  it('Should result with failure when ethService.getBalance fails', async () => {
    service.getCurrencyStats.mockImplementation(() =>
      Result.withContent(currencyStats)
    );
    service.getCurrencyBalance.mockResolvedValue(Result.withContent(100));
    ethService.getBalance.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute();
    expect(result.isFailure).toBeTruthy();
  });

  it('Should result with failure when bscContractService.getBalance fails', async () => {
    service.getCurrencyStats.mockImplementation(() =>
      Result.withContent(currencyStats)
    );
    service.getCurrencyBalance.mockResolvedValue(Result.withContent(100));
    ethService.getBalance.mockResolvedValue(Result.withContent(100));
    bscService.getBalance.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute();
    expect(result.isFailure).toBeTruthy();
  });

  it('Should result with number', async () => {
    service.getCurrencyStats.mockImplementation(() =>
      Result.withContent(currencyStats)
    );
    service.getCurrencyBalance.mockResolvedValue(Result.withContent(100));
    ethService.getBalance.mockResolvedValue(Result.withContent(100));
    bscService.getBalance.mockResolvedValue(Result.withContent(100));

    const result = await useCase.execute();
    expect(isNaN(parseFloat(result.content))).toBeFalsy();
  });
});
