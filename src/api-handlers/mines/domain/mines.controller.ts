import { Mine } from '@common/mines/domain/entities/mine';
import { Result } from '@core/architecture/domain/result';
import { inject, injectable } from 'inversify';
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
