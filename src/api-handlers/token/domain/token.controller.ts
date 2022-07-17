import { Result } from '@core/architecture/domain/result';
import { inject, injectable } from 'inversify';
import { GetTokenInput } from './entities/get-token.input';
import { GetTokenOutput } from './entities/get-token.output';
import { GetTokenSuppliesUseCase } from './use-cases/get-token-supplies.use-case';

/**
 * @class
 */
@injectable()
export class TokenController {
  public static Token = 'TOKEN_CONTROLLER';

  constructor(
    @inject(GetTokenSuppliesUseCase.Token)
    private getTokenSuppliesUseCase: GetTokenSuppliesUseCase
  ) {}

  /**
   * @async
   * @param {GetTokenInput} options
   * @returns {Promise<Result<???>>}
   */
  public async getToken(
    options: GetTokenInput
  ): Promise<Result<GetTokenOutput>> {
    return null;
  }
}
