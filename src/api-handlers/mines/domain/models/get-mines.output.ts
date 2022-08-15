import { Mine } from '@common/mines/domain/entities/mine';
import { MinesResultDto } from '../../data/mines.dtos';

/**
 * @class
 */
export class GetMinesOutput {
  /**
   *
   * @returns {GetMinesOutput}
   */
  public static fromEntities(entities: Mine[]): GetMinesOutput {
    return new GetMinesOutput(
      entities.map(entity => this.parseMineToJson(entity))
    );
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
   * @param {MinesResultDto[]} results
   */
  private constructor(
    public readonly results: MinesResultDto[],
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
