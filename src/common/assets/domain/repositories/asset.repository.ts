import { QueryModel } from '@core/architecture/domain/query-model';
import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { Asset } from '../entities/asset';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class AssetRepository {
  public static Token = 'ASSET_REPOSITORY';

  public abstract add(entity: Asset): Promise<Result<Asset>>;
  public abstract update(entity: Asset): Promise<Result<Asset>>;
  public abstract getByAssetId(assetId: bigint): Promise<Result<Asset>>;
  public abstract getManyByAssetId(assetId: bigint[]): Promise<Result<Asset[]>>;
  public abstract listAssets(query: QueryModel): Promise<Result<Asset[]>>;
}
