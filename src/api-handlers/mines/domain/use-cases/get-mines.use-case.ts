import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { GetMinesInput } from '../models/get-mines.input';
import { MineRepository } from '@common/mines/domain/mine.repository';
import { Mine } from '@common/mines/domain/entities/mine';
import { GetMinesQueryModel } from '../models/get-mines.query-model';

/**
 * @class
 */
@injectable()
export class GetMinesUseCase implements UseCase<Mine[]> {
  public static Token = 'GET_MINES_USE_CASE';

  constructor(
    @inject(MineRepository.Token)
    private mineRepository: MineRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<Asset[]>>}
   */
  public async execute(input: GetMinesInput): Promise<Result<Mine[]>> {
    return this.mineRepository.getMines(GetMinesQueryModel.create(input));
  }
}
