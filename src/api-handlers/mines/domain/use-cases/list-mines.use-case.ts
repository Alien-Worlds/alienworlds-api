import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { ListMinesInput } from '../models/list-mines.input';
import { MineRepository } from '@common/mines/domain/mine.repository';
import { Mine } from '@common/mines/domain/entities/mine';
import { ListMinesQueryModel } from '../models/list-mines.query-model';

/**
 * @class
 */
@injectable()
export class ListMinesUseCase implements UseCase<Mine[]> {
  public static Token = 'LIST_MINES_USE_CASE';

  constructor(
    @inject(MineRepository.Token)
    private mineRepository: MineRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<Asset[]>>}
   */
  public async execute(input: ListMinesInput): Promise<Result<Mine[]>> {
    return this.mineRepository.listMines(ListMinesQueryModel.create(input));
  }
}
