import { Result } from '@alien-worlds/api-core';
import { inject, injectable } from 'inversify';
import { MineLuck } from './entities/mine-luck';
import { ListMineLuckInput } from './models/list-mine-luck.input';
import { ListMineLuckUseCase } from './use-cases/list-mine-luck.use-case';

/**
 * @class
 */
@injectable()
export class MineLuckController {
  public static Token = 'MINELUCK_CONTROLLER';

  constructor(
    @inject(ListMineLuckUseCase.Token)
    private listMineLuckUseCase: ListMineLuckUseCase
  ) {}

  /**
   * @async
   * @param {ListMineLuckInput} options
   * @returns {Promise<Result<MineLuck[]>>}
   */
  public async listMineLuck(
    input: ListMineLuckInput
  ): Promise<Result<MineLuck[]>> {
    return this.listMineLuckUseCase.execute(input);
  }
}
