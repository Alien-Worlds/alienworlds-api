import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { EosDacService } from '@common/eos-dac/domain/eos-dac.service';
import {
  excludedEthAccounts,
  excludedWaxAccounts,
  excludedBscAccounts,
} from '../../token.consts';
import { BscContractService } from '../services/bsc-contract.service';
import { EthContractService } from '../services/eth-contract.service';

/**
 * Array reducer which decreases the initial value by the given current value
 *
 * @param {number} initial
 * @param {number} value
 * @returns {number}
 */
export const balanceReducer = (initial: number, value: number): number =>
  initial - value;

/**
 * @class
 */
@injectable()
export class GetCirculatingSupplyUseCase implements UseCase<string> {
  public static Token = 'GET_CIRCULATING_SUPPLY_USE_CASE';

  constructor(
    @inject(EosDacService.Token)
    private eosDacService: EosDacService,
    @inject(EthContractService.Token)
    private ethContractService: EthContractService,
    @inject(BscContractService.Token)
    private bscContractService: BscContractService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<string>>}
   */
  public async execute(): Promise<Result<string>> {
    const { content: currencyStats, failure: getCurrencyStatsFailure } =
      await this.eosDacService.getCurrencyStats();

    if (getCurrencyStatsFailure) {
      return Result.withFailure(getCurrencyStatsFailure);
    }

    const balances: number[] = [];

    for (const account of excludedWaxAccounts) {
      const { content: waxBalance, failure: getWaxBalanceFailure } =
        await this.eosDacService.getCurrencyBalance(account);

      if (getWaxBalanceFailure) {
        return Result.withFailure(getWaxBalanceFailure);
      }

      balances.push(waxBalance);
    }

    for (const account of excludedEthAccounts) {
      const { content: ethBalance, failure: getEthBalanceFailure } =
        await this.ethContractService.getBalance(account);

      if (getEthBalanceFailure) {
        return Result.withFailure(getEthBalanceFailure);
      }

      balances.push(ethBalance / 10000);
    }

    for (const account of excludedBscAccounts) {
      const { content: bscBalance, failure: getBscBalanceFailure } =
        await this.bscContractService.getBalance(account);

      if (getBscBalanceFailure) {
        return Result.withFailure(getBscBalanceFailure);
      }

      balances.push(bscBalance / 10000);
    }

    const supply = balances
      .reduce(
        balanceReducer,
        parseFloat(currencyStats.supply.replace(' TLM', ''))
      )
      .toFixed(4);

    return Result.withContent(supply);
  }
}
