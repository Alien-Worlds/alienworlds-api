import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { AssetRepository } from '@common/assets/domain/repositories/asset.repository';
import { Asset } from '@common/assets/domain/entities/asset';
import { ListAssetsInput } from '../models/list-assets.input';
import { ListAssetsQueryModel } from '../models/list-assets.query-model';
import { Failure } from '@core/architecture/domain/failure';
import { AssetsNotFoundError } from '@common/assets/domain/errors/assets-not-found.error';

/**
 * @class
 */
@injectable()
export class ListAssetsUseCase implements UseCase<Asset[]> {
  public static Token = 'LIST_ASSETS_USE_CASE';

  constructor(
    @inject(AssetRepository.Token)
    private assetRepository: AssetRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<Asset[]>>}
   */
  public async execute(input: ListAssetsInput): Promise<Result<Asset[]>> {
    const { assetIds, limit, schema, owner, offset } = input;

    if (assetIds.length > 0) {
      return this.assetRepository.getManyByAssetId(assetIds);
    }

    if (owner) {
      return this.assetRepository.listAssets(
        ListAssetsQueryModel.create(owner, schema, offset, limit)
      );
    }

    return Result.withFailure(Failure.fromError(new AssetsNotFoundError()));
  }
}
