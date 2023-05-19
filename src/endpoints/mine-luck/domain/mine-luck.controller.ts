import { inject, injectable } from '@alien-worlds/api-core';
import { ListMineLuckInput } from './models/list-mine-luck.input';
import { ListMineLuckUseCase } from './use-cases/list-mine-luck.use-case';
import { ListMineLuckOutput } from './models/list-mine-luck.output';

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
  ): Promise<ListMineLuckOutput> {
    const result = await this.listMineLuckUseCase.execute(input);

    return ListMineLuckOutput.create(result);
  }
}
