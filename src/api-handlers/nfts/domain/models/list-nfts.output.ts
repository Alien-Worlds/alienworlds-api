import { NFT } from '@common/nfts/domain/entities/nft';
import { removeUndefinedProperties } from '@common/utils/dto.utils';

export class ListNftsOutput {
  public static create(nfts?: NFT[], count?: number): ListNftsOutput {
    return new ListNftsOutput(nfts || [], count || 0);
  }

  private constructor(
    public readonly results: NFT[],
    public readonly count: number
  ) {}

  public toJson() {
    const { results, count } = this;
    return {
      results: results.map(this.parseNftToResult),
      count,
    };
  }
  /**
   * Get Json object from the entity
   *
   * @returns {object}
   */
  private parseNftToResult(nft: NFT) {
    const {
      id,
      miner,
      params,
      landId,
      rand1,
      rand2,
      rand3,
      templateId,
      blockNumber,
      blockTimestamp,
      globalSequence,
      templateData,
    } = nft;
    const dto = {
      _id: id,
      miner,
      params: params.toDto(),
      land_id: landId,
      rand1,
      rand2,
      rand3,
      template_id: templateId,
      block_num: Number(blockNumber),
      block_timestamp: blockTimestamp,
      global_sequence: Number(globalSequence),
      template_data: templateData.toDto(),
    };

    return removeUndefinedProperties<object>(dto);
  }
}
