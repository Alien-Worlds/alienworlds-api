import { NftsNotFoundError } from '@common/nfts/domain/errors/nfts-not-found.error';
import { Failure } from '@core/architecture/domain/failure';
import { QueryModel } from '@core/architecture/domain/query-model';
import { Result } from '@core/architecture/domain/result';
import { MongoFindQueryParams } from '@core/storage/data/mongo.types';
import { NFT } from '../../domain/entities/nft';
import { NftRepository } from '../../domain/repositories/nft.repository';
import { NftMongoSource } from '../data-sources/nft.mongo.source';
import { NftDocument } from '../nfts.dtos';

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
   * @param {QueryModel<MongoFindQueryParams<NftDocument>>} model
   * @returns {Promise<Result<NFT[]>>}
   */
  public async getNfts(
    model: QueryModel<MongoFindQueryParams<NftDocument>>
  ): Promise<Result<NFT[]>> {
    try {
      const { filter, options } = model.toQueryParams();
      const dtos = await this.nftsMongoSource.find(filter, options);

      return dtos && dtos.length > 0
        ? Result.withContent(dtos.map(NFT.fromDto))
        : Result.withFailure(Failure.fromError(new NftsNotFoundError()));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   *
   * @param {QueryModel<MongoFindQueryParams<NftDocument>>} model
   * @returns {Promise<Result<number>>}
   */
  public async countNfts(
    model: QueryModel<MongoFindQueryParams<NftDocument>>
  ): Promise<Result<number>> {
    try {
      const { filter, options } = model.toQueryParams();
      const count = await this.nftsMongoSource.count(filter, options);

      return count > 0
        ? Result.withContent(count)
        : Result.withFailure(Failure.fromError(new NftsNotFoundError()));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

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
