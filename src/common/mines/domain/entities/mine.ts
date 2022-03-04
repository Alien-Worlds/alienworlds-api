import { MineDocument } from '../../data/mines.dtos';

/**
 * The class representing mine entity.
 *
 * @class
 */
export class Mine {
  private constructor(
    public readonly id: string,
    public readonly miner: string,
    public readonly invalid: number,
    public readonly error: string,
    public readonly delay: number,
    public readonly difficulty: number,
    public readonly ease: number,
    public readonly luck: number,
    public readonly commission: number,
    public readonly bounty: number,
    public readonly landId: string,
    public readonly planetName: string,
    public readonly landowner: string,
    public readonly bagItems: number[],
    public readonly offset: number,
    public readonly blockNum: number,
    public readonly blockTimestamp: string,
    public readonly globalSequence: number,
    public readonly txId: string
  ) {}

  /**
   * Creates Mine class based on the provided MineDocument.
   *
   * @static
   * @public
   * @param {MineDocument} dto
   * @returns {Mine} instance of Mine
   */
  public static fromDto(dto: MineDocument): Mine {
    const {
      _id,
      miner,
      params,
      bounty,
      land_id,
      planet_name,
      landowner,
      bag_items,
      offset,
      block_num,
      block_timestamp,
      global_sequence,
      tx_id,
    } = dto;

    const { invalid, error, delay, difficulty, ease, luck, commission } =
      params || {};

    return new Mine(
      _id,
      miner,
      invalid,
      error,
      delay,
      difficulty,
      ease,
      luck,
      commission,
      bounty,
      land_id,
      planet_name,
      landowner,
      bag_items,
      offset,
      block_num,
      block_timestamp,
      global_sequence,
      tx_id
    );
  }
}
