import { Request } from '@alien-worlds/api-core';
import { ListMinesRequestQuery } from '../../data/mines.dtos';

/**
 * @class
 */
export class ListMinesInput {
  /**
   *
   * @param {ListMinesRequestQuery} dto
   * @returns {ListMinesInput}
   */
  public static fromRequest(
    request: Request<unknown, unknown, ListMinesRequestQuery>
  ): ListMinesInput {
    const {
      query: {
        limit,
        from,
        to,
        global_sequence_from,
        global_sequence_to,
        miner,
        landowner,
        land_id,
        planet_name,
        tx_id,
        sort,
      },
    } = request;

    return new ListMinesInput(
      limit,
      from,
      to,
      global_sequence_from,
      global_sequence_to,
      miner,
      landowner,
      land_id,
      planet_name,
      tx_id,
      sort
    );
  }
  /**
   *
   * @constructor
   * @private
   */
  private constructor(
    public readonly limit: number,
    public readonly from: string,
    public readonly to: string,
    public readonly globalSequenceFrom: number,
    public readonly globalSequenceTo: number,
    public readonly miner: string,
    public readonly landowner: string,
    public readonly landId: string,
    public readonly planetName: string,
    public readonly txId: string,
    public readonly sort: string
  ) {}
}
