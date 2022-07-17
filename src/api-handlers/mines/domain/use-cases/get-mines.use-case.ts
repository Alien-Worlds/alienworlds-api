import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { GetMinesOptions } from '../entities/mines-request-options';
import { MineRepository } from '@common/mines/domain/mine.repository';
import { Mine } from '@common/mines/domain/entities/mine';
import { getSortingDirectionByString } from '@common/utils/api.utils';

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
  public async execute(options: GetMinesOptions): Promise<Result<Mine[]>> {
    const sort = getSortingDirectionByString(options.sort);
    return this.mineRepository.getByData();
  }
}
