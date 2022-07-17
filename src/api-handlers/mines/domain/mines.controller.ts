import { LimitExceededError } from '@common/api/domain/errors/limit-exceeded.error';
import { Mine } from '@common/mines/domain/entities/mine';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { inject, injectable } from 'inversify';
import { GetMinesOptions } from './entities/mines-request-options';
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
   * @param {GetMinesOptions} options
   * @returns {Promise<Result<Mine[]>>}
   */
  public async getMines(options: GetMinesOptions): Promise<Result<Mine[]>> {
    if (options.limit > 5000) {
      return Result.withFailure(
        Failure.fromError(new LimitExceededError(5000))
      );
    }
    return this.getMinesUseCase.execute(options);
  }
}
