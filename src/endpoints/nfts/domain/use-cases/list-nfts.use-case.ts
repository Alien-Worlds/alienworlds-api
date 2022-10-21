import { Nft, NftRepository } from '@alien-worlds/alienworlds-api-common';
import { Result, UseCase } from '@alien-worlds/api-core';
import { inject, injectable } from 'inversify';
import { ListNftsInput } from '../models/list-nfts.input';
import { ListNftsQueryModel } from '../models/list-nfts.query-model';

/**
 * @class
 */
@injectable()
export class ListNftsUseCase implements UseCase<Nft[]> {
  public static Token = 'LIST_NFTS_USE_CASE';

  constructor(
    @inject(NftRepository.Token)
    private nftRepository: NftRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<Nft[]>>}
   */
  public async execute(model: ListNftsInput): Promise<Result<Nft[]>> {
    return this.nftRepository.find(ListNftsQueryModel.create(model));
  }
}
