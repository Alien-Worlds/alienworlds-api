import { QueryModel } from '@core/architecture/domain/query-model';
import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { NFT } from '../entities/nft';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class NftRepository {
  public static Token = 'NFT_REPOSITORY';

  public abstract add(nft: NFT): Promise<Result<NFT>>;
  public abstract getNfts(model: QueryModel): Promise<Result<NFT[]>>;
  public abstract countNfts(model: QueryModel): Promise<Result<number>>;
}
