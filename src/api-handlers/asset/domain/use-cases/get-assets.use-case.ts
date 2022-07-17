import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { AssetRepository } from '@common/assets/domain/repositories/asset.repository';
import { Asset } from '@common/assets/domain/entities/asset';
import { GetAssetsOptions } from '../entities/asset-request-options';
import { GetAssetsQuery } from '../entities/get-assets.query';
import { Failure } from '@core/architecture/domain/failure';
import { AssetsNotFoundError } from '@common/assets/domain/errors/assets-not-found.error';

/**
 * @class
 */
@injectable()
export class GetAssetsUseCase implements UseCase<Asset[]> {
  public static Token = 'GET_ASSETS_USE_CASE';

  constructor(
    @inject(AssetRepository.Token)
    private assetRepository: AssetRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<Asset[]>>}
   */
  public async execute(options: GetAssetsOptions): Promise<Result<Asset[]>> {
    const { assetIds, limit, schema, owner, offset } = options;

    if (assetIds) {
      return this.assetRepository.getManyByAssetId(assetIds);
    }

    if (owner) {
      return this.assetRepository.getByData(
        GetAssetsQuery.create(owner, schema, offset, limit)
      );
    }

    // TODO question should we log missing options or return failure
    return Result.withFailure(Failure.fromError(new AssetsNotFoundError()));
  }
}
