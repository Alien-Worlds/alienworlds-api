import { Nft } from '@alien-worlds/alienworlds-api-common';
import { removeUndefinedProperties } from '@alien-worlds/api-core';

export class ListNftsOutput {
  public static create(nfts?: Nft[], count?: number): ListNftsOutput {
    return new ListNftsOutput(nfts || [], count || 0);
  }

  private constructor(
    public readonly results: Nft[],
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
  private parseNftToResult(nft: Nft) {
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
