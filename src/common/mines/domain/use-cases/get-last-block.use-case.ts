import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { Mine } from '../entities/mine';
import { MineRepository } from '../mine.repository';

/**
 * @class
 */
@injectable()
export class GetLastBlockUseCase implements UseCase<Mine> {
  public static Token = 'GET_LAST_BLOCK_USE_CASE';

  /**
   * @constructor
   * @param {MineRepository} minesRepository
   */
  constructor(
    @inject(MineRepository.Token) private minesRepository: MineRepository
  ) {}

  /**
   * Gets the last block indexed
   *
   * @async
   * @returns {Promise<Result<Mine>>}
   */
  public async execute(): Promise<Result<Mine>> {
    const result = await this.minesRepository.getLastBlock();
    if (result.isFailure) {
      //TODO: should we log the failure here?
    }
    return result;
  }
}
