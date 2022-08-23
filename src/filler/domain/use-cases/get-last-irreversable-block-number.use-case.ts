/* eslint-disable @typescript-eslint/no-var-requires */

import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { EosDacService } from '../../../common/eos-dac/domain/eos-dac.service';
import { LastIrreversableBlockNotFoundError } from '../errors/last-irreversable-block-not-found.error';

/**
 * @class
 */
@injectable()
export class GetLastIrreversableBlockNumUseCase implements UseCase<bigint> {
  public static Token = 'LIST_LAST_IRREVERSABLE_BLOCK_NUMBER_USE_CASE';

  /**
   * @constructor
   * @param {EosDacService} eosDacService
   */
  constructor(
    @inject(EosDacService.Token) private eosDacService: EosDacService
  ) {}

  /**
   * Gets information from eosdac and returns last irreversible block number.
   * If an error occurs, it returns the Failure object.
   *
   * @async
   * @returns {Promise<Result<bigint>>}
   */
  public async execute(): Promise<Result<bigint>> {
    const { content, failure } = await this.eosDacService.getInfo();

    if (failure) {
      return Result.withFailure(failure);
    }

    if (!content.lastIrreversibleBlockNum) {
      return Result.withFailure(
        Failure.fromError(new LastIrreversableBlockNotFoundError())
      );
    }

    return Result.withContent(content.lastIrreversibleBlockNum);
  }
}
