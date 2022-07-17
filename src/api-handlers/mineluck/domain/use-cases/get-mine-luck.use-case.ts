import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { Asset } from '@common/assets/domain/entities/asset';
import { Failure } from '@core/architecture/domain/failure';
import { AssetsNotFoundError } from '@common/assets/domain/errors/assets-not-found.error';
import { GetMineLuckOptions } from '../entities/mine-luck-request-options';
import { MineRepository } from '@common/mines/domain/mine.repository';
import { MineLuck } from '../entities/mine-luck';

/**
 * @class
 */
@injectable()
export class GetMineLuckUseCase implements UseCase<MineLuck[]> {
  public static Token = 'GET_MINE_LUCK_USE_CASE';

  constructor(
    @inject(MineRepository.Token)
    private mineRepository: MineRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<Asset[]>>}
   */
  public async execute(
    options: GetMineLuckOptions
  ): Promise<Result<MineLuck[]>> {
    const { assetIds, limit, schema, owner, offset } = options;

    return this.mineRepository.getByData();

    // TODO question should we log missing options or return failure
    return Result.withFailure(Failure.fromError(new AssetsNotFoundError()));
  }
}
