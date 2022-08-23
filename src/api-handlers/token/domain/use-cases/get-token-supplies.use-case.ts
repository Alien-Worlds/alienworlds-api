import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { EosDacService } from '@common/eos-dac/domain/eos-dac.service';

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
