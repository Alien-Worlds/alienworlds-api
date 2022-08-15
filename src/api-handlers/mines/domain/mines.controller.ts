import { Mine } from '@common/mines/domain/entities/mine';
import { Result } from '@core/architecture/domain/result';
import { inject, injectable } from 'inversify';
import { GetMinesInput } from './models/get-mines.input';
import { GetMinesUseCase } from './use-cases/get-mines.use-case';

/**
 * @class
 */
@injectable()
export class MinesController {
  public static Token = 'MINES_CONTROLLER';

  constructor(
    @inject(GetMinesUseCase.Token) private getMinesUseCase: GetMinesUseCase
  ) {}

  /**
   * @async
   * @param {GetMinesInput} input
   * @returns {Promise<Result<Mine[]>>}
   */
  public async getMines(input: GetMinesInput): Promise<Result<Mine[]>> {
    return this.getMinesUseCase.execute(input);
  }
}
