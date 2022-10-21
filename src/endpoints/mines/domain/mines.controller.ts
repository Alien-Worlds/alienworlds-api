import { inject, injectable } from '@alien-worlds/api-core';
import { Mine } from '@alien-worlds/alienworlds-api-common';
import { Result } from '@alien-worlds/api-core';
import { ListMinesInput } from './models/list-mines.input';
import { ListMinesUseCase } from './use-cases/list-mines.use-case';

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
  public async listMines(input: ListMinesInput): Promise<Result<Mine[]>> {
    return this.listMinesUseCase.execute(input);
  }
}
