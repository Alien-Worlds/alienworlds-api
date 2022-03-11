import { Result } from '@core/domain/result';
import { UseCase } from '@core/domain/use-case';
import { inject, injectable } from 'inversify';
import { Mine } from '../entities/mine';
import { MinesRepository } from '../mines.repository';

/**
 * @class
 */
@injectable()
export class GetLastBlockUseCase implements UseCase<Mine> {
  public static Token = 'GET_LAST_BLOCK_USE_CASE';

  /**
   * @constructor
   * @param {MinesRepository} minesRepository
   */
  constructor(
    @inject(MinesRepository.Token) private minesRepository: MinesRepository
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
