import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { GetTokenInput } from '../entities/get-token.input';
import { EosDacService } from '@common/eos-dac/domain/eos-dac.service';
import { TokenType } from 'api-handlers/token/token.enums';
import { Failure } from '@core/architecture/domain/failure';
import { InvalidTypeError } from '../error/invalid-type.error';

/**
 * @class
 */
@injectable()
export class GetTokenSuppliesUseCase implements UseCase<string> {
  public static Token = 'GET_TOKEN_SUPPLIES_USE_CASE';

  constructor(
    @inject(EosDacService.Token)
    private eosDacService: EosDacService
  ) {}

  /**
   * @async
   * @param {GetTokenInput} input
   * @returns {Promise<Result<string>>}
   */
  public async execute(input: GetTokenInput): Promise<Result<string>> {
    const { type } = input;

    if (type === TokenType.Supply) {
      const { content: currencyStats, failure: getCurrencyStatsFailure } =
        await this.eosDacService.getCurrencyStats();

      if (getCurrencyStatsFailure) {
        return Result.withFailure(getCurrencyStatsFailure);
      }

      return Result.withContent(currencyStats.supply);
    }

    if (type === TokenType.Circulating) {
      //
    }

    return Result.withFailure(Failure.fromError(new InvalidTypeError()));
  }
}
