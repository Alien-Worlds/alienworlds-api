import { Result, UseCase } from '@alien-worlds/api-core';
import { inject, injectable } from '@alien-worlds/api-core';
import { EosDacService } from '../services/eos-dac.service';

/**
 * @class
 */
@injectable()
export class GetTokenSuppliesUseCase implements UseCase<string> {
  public static Token = 'LIST_TOKEN_SUPPLIES_USE_CASE';

  constructor(
    @inject(EosDacService.Token)
    private eosDacService: EosDacService
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

    return Result.withContent(currencyStats.supply);
  }
}
