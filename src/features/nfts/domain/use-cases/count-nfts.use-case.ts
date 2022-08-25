import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { NftRepository } from '@common/nfts/domain/repositories/nft.repository';
import { ListNftsInput } from '../models/list-nfts.input';
import { CountNftsQueryModel } from '../models/count-nfts.query-model';

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
    return this.nftRepository.countNfts(CountNftsQueryModel.create(model));
  }
}
