import { Asset } from '@common/assets/domain/entities/asset';
import { AssetNotFoundError } from '@common/assets/domain/errors/asset-not-found.error';
import { AssetsNotFoundError } from '@common/assets/domain/errors/assets-not-found.error';
import { AssetRepository } from '@common/assets/domain/repositories/asset.repository';
import { Failure } from '@core/architecture/domain/failure';
import { QueryModel } from '@core/architecture/domain/query-model';
import { Result } from '@core/architecture/domain/result';
import { MongoFindQueryParams } from '@core/storage/data/mongo.types';
import { AssetDocument } from '../assets.dtos';
import { AssetMongoSource } from '../data-sources/asset.mongo.source';

/**
 * @class
 */
export class AssetRepositoryImpl implements AssetRepository {
  /**
   * @constructor
   * @param {AssetMongoSource} assetMongoSource
   */
  constructor(private assetMongoSource: AssetMongoSource) {}

  /**
   * Send updated asset to data source
   *
   * @async
   * @param {Asset} entity
   * @returns {Promise<Result<Asset>>}
   */
  public async update(entity: Asset): Promise<Result<Asset>> {
    try {
      const dto = entity.toDto();
      await this.assetMongoSource.update(dto);
      return Result.withContent(entity);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Get asset by asset_id
   *
   * @async
   * @param {number} assetId
   * @returns {Promise<Result<Asset>>}
   */
  public async getByAssetId(assetId: bigint): Promise<Result<Asset>> {
    try {
      const dto = await this.assetMongoSource.findByAssetId(assetId);

      return dto
        ? Result.withContent(Asset.fromDto(dto))
        : Result.withFailure(
            Failure.fromError(new AssetNotFoundError(assetId))
          );
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Get assets by asset_ids
   *
   * @async
   * @param {number} assetId
   * @returns {Promise<Result<Asset[]>>}
   */
  public async getManyByAssetId(assetIds: bigint[]): Promise<Result<Asset[]>> {
    try {
      const dtos = await this.assetMongoSource.findManyByAssetIds(assetIds);

      return dtos && dtos.length > 0
        ? Result.withContent(dtos.map(Asset.fromDto))
        : Result.withFailure(Failure.fromError(new AssetsNotFoundError()));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Get assets by data
   *
   * @async
   * @param {QueryModel} query
   * @returns {Promise<Result<Asset[]>>}
   */
  public async listAssets(
    query: QueryModel<MongoFindQueryParams<AssetDocument>>
  ): Promise<Result<Asset[]>> {
    try {
      const { filter, options } = query.toQueryParams();
      const dtos = await this.assetMongoSource.find(filter, options);

      return dtos && dtos.length > 0
        ? Result.withContent(dtos.map(Asset.fromDto))
        : Result.withFailure(Failure.fromError(new AssetsNotFoundError()));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Add asset to the data source
   *
   * @async
   * @param {Asset} entity
   * @returns {Asset}
   */
  public async add(entity: Asset): Promise<Result<Asset>> {
    try {
      const dto = entity.toDto();
      const id = await this.assetMongoSource.insert(dto);
      dto._id = id;
      return Result.withContent(Asset.fromDto(dto));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
