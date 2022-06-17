import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { NFT } from '../../domain/entities/nft';
import { NftRepository } from '../../domain/repositories/nft.repository';
import { NftMongoSource } from '../data-sources/nft.mongo.source';

/**
 * @class
 */
export class NftRepositoryImpl implements NftRepository {
  /**
   * @constructor
   * @param {NftMongoSource} nftsMongoSource
   */
  constructor(private nftsMongoSource: NftMongoSource) {}

  /**
   *
   * @async
   * @returns {Promise<Result<NFT>}
   */
  public async add(nft: NFT): Promise<Result<NFT>> {
    try {
      const dto = nft.toDto();
      const id = await this.nftsMongoSource.insertOne(dto);
      dto._id = id;
      return Result.withContent(NFT.fromDto(dto));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
