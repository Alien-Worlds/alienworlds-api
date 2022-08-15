import { Result } from '@core/architecture/domain/result';
import { inject, injectable } from 'inversify';
import { MineLuck } from './entities/mine-luck';
import { GetMineLuckInput } from './models/get-mine-luck.input';
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
   * @param {GetMineLuckInput} options
   * @returns {Promise<Result<MineLuck[]>>}
   */
  public async getMineLuck(
    input: GetMineLuckInput
  ): Promise<Result<MineLuck[]>> {
    return this.getMineLuckUseCase.execute(input);
  }
}
