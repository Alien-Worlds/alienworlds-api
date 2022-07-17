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
  public abstract getByData(data: unknown): Promise<Result<NFT[]>>;
  public abstract countByData(data: unknown): Promise<Result<number>>;
}
