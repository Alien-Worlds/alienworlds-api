import { Mine } from '@alien-worlds/alienworlds-api-common';
import { EntityNotFoundError, Result } from '@alien-worlds/api-core';

/**
 * @class
 */
export class ListMinesOutput {
  /**
   *
   * @returns {ListMinesOutput}
   */
  public static createEmpty(): ListMinesOutput {
    return new ListMinesOutput(Result.withContent([]));
  }

  public static create(result: Result<Mine[]>): ListMinesOutput {
    return new ListMinesOutput(result);
  }

  /**
   *
   * @constructor
   * @private
   * @param {MineResultDto[]} results
   */
  private constructor(
    public readonly result: Result<Mine[]>,
    public readonly count: number = -1
  ) {}

  public toResponse() {
    const { result } = this;

    if (result.isFailure) {
      if (result.failure.error instanceof EntityNotFoundError) {
        return {
          status: 200,
          body: ListMinesOutput.createEmpty(),
        };
      }

      return {
        status: 500,
        body: result.failure.error.message,
      };
    }

    return {
      status: 200,
      body: {
        results: result.content.map(mine => {
          const {
            id,
            miner,
            params,
            bounty,
            landId,
            planetName,
            landowner,
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
        }),
        count: this.count,
      },
    };
  }
}
