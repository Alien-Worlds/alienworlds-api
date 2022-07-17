import { Result } from '@core/architecture/domain/result';
import { inject, injectable } from 'inversify';
import { MineLuck } from './entities/mine-luck';
import { GetMineLuckOptions } from './entities/mine-luck-request-options';
import { GetMineLuckUseCase } from './use-cases/get-mine-luck.use-case';

/**
 * @class
 */
@injectable()
export class MineLuckController {
  public static Token = 'MINELUCK_CONTROLLER';

  constructor(
    @inject(GetMineLuckUseCase.Token)
    private getMineLuckUseCase: GetMineLuckUseCase
  ) {}

  /**
   * @async
   * @param {GetMineLuckOptions} options
   * @returns {Promise<Result<MineLuck[]>>}
   */
  public async getMineLuck(
    options: GetMineLuckOptions
  ): Promise<Result<MineLuck[]>> {
    return this.getMineLuckUseCase.execute(options);
  }
}
