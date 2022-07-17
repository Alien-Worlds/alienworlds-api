import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { GetTokenInput } from '../entities/get-token.input';
import { EosDacService } from '@common/eos-dac/domain/eos-dac.service';
import { TokenType } from 'api-handlers/token/token.enums';
import { Failure } from '@core/architecture/domain/failure';
import { InvalidTypeError } from '../error/invalid-type.error';
import {
  excludedEthAccounts,
  excludedWaxAccounts,
} from 'api-handlers/token/token.consts';

/**
 * @class
 */
@injectable()
export class GetCirculatingSupplyUseCase implements UseCase<string> {
  public static Token = 'GET_CIRCULATING_SUPPLY_USE_CASE';

  constructor(
    @inject(EosDacService.Token)
    private eosDacService: EosDacService
  ) {}

  private async getCurrencyBalanceByAccount(account: string) {
    const { content: currencyBalance, failure: getCurrencyBalanceFailure } =
      await this.eosDacService.getCurrencyBalance(account);

    if (getCurrencyBalanceFailure) {
      return Result.withFailure(getCurrencyBalanceFailure);
    }
  }

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

    const balances = [];

    for (const account of excludedWaxAccounts) {
      const { content: currencyBalance, failure: getCurrencyBalanceFailure } =
        await this.eosDacService.getCurrencyBalance(account);

      if (getCurrencyBalanceFailure) {
        return Result.withFailure(getCurrencyBalanceFailure);
      }

      balances.push(currencyBalance);
    }

    for (const account of excludedEthAccounts) {
      const { content: currencyBalance, failure: getCurrencyBalanceFailure } =
        await this.eosDacService.getCurrencyBalance(account);

      if (getCurrencyBalanceFailure) {
        return Result.withFailure(getCurrencyBalanceFailure);
      }

      balances.push(currencyBalance);
    }

    return Result.withContent(currencyStats.supply);
  }
}
