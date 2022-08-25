import { ListMinesRequestDto } from '../../data/mines.dtos';

/**
 * @class
 */
export class ListMinesInput {
  /**
   *
   * @param {ListMinesRequestDto} dto
   * @returns {ListMinesInput}
   */
  public static fromRequest(dto: ListMinesRequestDto): ListMinesInput {
    const {
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
    } = dto;

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
