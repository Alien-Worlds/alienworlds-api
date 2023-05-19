import { inject, injectable } from '@alien-worlds/api-core';
import { GetTokenInput } from './models/get-token.input';
import { InvalidTypeError } from './error/invalid-type.error';
import { GetCirculatingSupplyUseCase } from './use-cases/get-circulating-supply.use-case';
import { GetTokenSuppliesUseCase } from './use-cases/get-token-supplies.use-case';
import { TokenType } from '../token.enums';
import { Failure, Result } from '@alien-worlds/api-core';
import { GetTokenOutput } from './models/get-token.output';

/**
 * @class
 */
@injectable()
export class TokenController {
  public static Token = 'TOKEN_CONTROLLER';

  constructor(
    @inject(GetCirculatingSupplyUseCase.Token)
    private getCirculatingSupplyUseCase: GetCirculatingSupplyUseCase,
    @inject(GetTokenSuppliesUseCase.Token)
    private getTokenSuppliesUseCase: GetTokenSuppliesUseCase
  ) {}

  /**
   * @async
   * @param {GetTokenInput} input
   * @returns {Promise<Result<string>>}
   */
  public async getToken(input: GetTokenInput): Promise<GetTokenOutput> {
    const { type } = input;

    if (type === TokenType.Supply) {
      const getTokenSuppliesResult =
        await this.getTokenSuppliesUseCase.execute();

      return GetTokenOutput.create(getTokenSuppliesResult);
    }

    if (type === TokenType.Circulating) {
      const getCirculatingSupplyResult =
        await this.getCirculatingSupplyUseCase.execute();

      return GetTokenOutput.create(getCirculatingSupplyResult);
    }
    return GetTokenOutput.create(
      Result.withFailure(Failure.fromError(new InvalidTypeError()))
    );
  }
}
