/* eslint-disable @typescript-eslint/no-var-requires */

import { inject, injectable } from 'inversify';
import { EosDacRepository } from '../../../common/eos-dac/domain/eos-dac.repository';
import { Result } from '../../../core/domain/result';
import { UseCase } from '../../../core/domain/use-case';

/**
 * @class
 */
@injectable()
export class GetLastIrreversableBlockNumUseCase implements UseCase<number> {
  public static Token = 'GET_LAST_IRREVERSABLE_BLOCK_NUMBER_USE_CASE';

  /**
   * @constructor
   * @param {EosDacRepository} eosDacRepository
   */
  constructor(
    @inject(EosDacRepository.Token) private eosDacRepository: EosDacRepository
  ) {}

  /**
   * Gets information from eosdac and returns last irreversible block number.
   * If an error occurs, it returns the Failure object.
   *
   * @async
   * @returns {Promise<Result<number>>}
   */
  public async execute(): Promise<Result<number>> {
    const { content, failure } = await this.eosDacRepository.getInfo();

    if (failure) {
      return Result.withFailure(failure);
    }

    return Result.withContent(content.lastIrreversibleBlockNum);
  }
}
