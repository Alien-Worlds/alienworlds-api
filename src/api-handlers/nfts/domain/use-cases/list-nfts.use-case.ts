import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { NFT } from '@common/nfts/domain/entities/nft';
import { NftRepository } from '@common/nfts/domain/repositories/nft.repository';
import { ListNftsInput } from '../models/list-nfts.input';
import { ListNftsQueryModel } from '../models/list-nfts.query-model';

/**
 * @class
 */
@injectable()
export class ListNftsUseCase implements UseCase<NFT[]> {
  public static Token = 'LIST_NFTS_USE_CASE';

  constructor(
    @inject(NftRepository.Token)
    private nftRepository: NftRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<NFT[]>>}
   */
  public async execute(model: ListNftsInput): Promise<Result<NFT[]>> {
    return this.nftRepository.listNfts(ListNftsQueryModel.create(model));
  }
}
