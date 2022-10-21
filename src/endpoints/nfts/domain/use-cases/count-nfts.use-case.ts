import { inject, injectable } from '@alien-worlds/api-core';
import { ListNftsInput } from '../models/list-nfts.input';
import { CountNftsQueryModel } from '../models/count-nfts.query-model';
import { Result, UseCase } from '@alien-worlds/api-core';
import { NftRepository } from '@alien-worlds/alienworlds-api-common';

/**
 * @class
 */
@injectable()
export class CountNftsUseCase implements UseCase<number> {
  public static Token = 'COUNT_NFTS_USE_CASE';

  constructor(
    @inject(NftRepository.Token)
    private nftRepository: NftRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<NFT[]>>}
   */
  public async execute(model: ListNftsInput): Promise<Result<number>> {
    return this.nftRepository.count(CountNftsQueryModel.create(model));
  }
}
