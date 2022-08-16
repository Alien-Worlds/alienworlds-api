import { MinesRequestDto } from '../../data/mines.dtos';

/**
 * @class
 */
export class GetMinesInput {
  /**
   *
   * @param {MinesRequestDto} dto
   * @returns {GetMinesInput}
   */
  public static fromRequest(dto: MinesRequestDto): GetMinesInput {
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

    return new GetMinesInput(
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
