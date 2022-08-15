import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { NFT } from '@common/nfts/domain/entities/nft';
import { NftRepository } from '@common/nfts/domain/repositories/nft.repository';
import { GetNftsInput } from '../models/get-nfts.input';
import { GetNftsQueryModel } from '../models/get-nfts.query-model';

/**
 * @class
 */
@injectable()
export class GetNftsUseCase implements UseCase<NFT[]> {
  public static Token = 'GET_NFTS_USE_CASE';

  constructor(
    @inject(NftRepository.Token)
    private nftRepository: NftRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<NFT[]>>}
   */
  public async execute(model: GetNftsInput): Promise<Result<NFT[]>> {
    return this.nftRepository.getNfts(GetNftsQueryModel.create(model));
  }
}
