import { inject, injectable } from '@alien-worlds/api-core';
import { ListMinesInput } from './models/list-mines.input';
import { ListMinesUseCase } from './use-cases/list-mines.use-case';
import { ListMinesOutput } from './models/list-mines.output';

/**
 * @class
 */
@injectable()
export class MinesController {
  public static Token = 'MINES_CONTROLLER';

  constructor(
    @inject(ListMinesUseCase.Token) private listMinesUseCase: ListMinesUseCase
  ) {}

  /**
   * @async
   * @param {ListMinesInput} input
   * @returns {Promise<Result<Mine[]>>}
   */
  public async listMines(input: ListMinesInput): Promise<ListMinesOutput> {
    const result = await this.listMinesUseCase.execute(input);

    return ListMinesOutput.create(result);
  }
}
