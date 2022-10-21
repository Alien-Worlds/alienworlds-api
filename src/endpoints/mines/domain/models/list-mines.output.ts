import { Mine } from '@alien-worlds/alienworlds-api-common';
import { MineResultDto } from '../../data/mines.dtos';

/**
 * @class
 */
export class ListMinesOutput {
  /**
   *
   * @returns {ListMinesOutput}
   */
  public static fromEntities(entities: Mine[]): ListMinesOutput {
    return new ListMinesOutput(
      entities.map(entity => this.parseMineToJson(entity))
    );
  }

  /**
   *
   * @returns {ListMinesOutput}
   */
  public static createEmpty(): ListMinesOutput {
    return new ListMinesOutput([], -1);
  }

  private static parseMineToJson(mine: Mine) {
    const {
      id,
      miner,
      params,
      bounty,
      landId,
      planetName,
      landowner: landowner,
      bagItems,
      offset,
      blockNumber,
      blockTimestamp,
      globalSequence,
      transactionId,
    } = mine;
    return {
      _id: id,
      miner,
      params,
      bounty,
      land_id: landId,
      planet_name: planetName,
      landowner,
      bag_items: bagItems.map(item => Number(item)),
      offset,
      block_num: Number(blockNumber),
      block_timestamp: blockTimestamp,
      global_sequence: Number(globalSequence),
      tx_id: transactionId,
    };
  }

  /**
   *
   * @constructor
   * @private
   * @param {MineResultDto[]} results
   */
  private constructor(
    public readonly results: MineResultDto[],
    // TODO: why -1?
    public readonly count: number = -1
  ) {}

  public toJson() {
    const { count, results } = this;
    return {
      results,
      count,
    };
  }
}
