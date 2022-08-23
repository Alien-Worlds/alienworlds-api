import { MineLuckDocument } from '../../data/mine-luck.dtos';

/**
 * Represents computed mine luck data.
 *
 * @class
 */
export class MineLuck {
  /**
   * Creates instances of the class MineLuck based on given MineLuckDocument.
   *
   * @static
   * @public
   * @param {MineLuckDocument} dto
   * @returns {MineLuck} instance of MineLuck
   */
  public static fromDto(dto: MineLuckDocument): MineLuck {
    const { _id, total_luck, total_mines, planets, tools, avg_luck, rarities } =
      dto;

    return new MineLuck(
      total_luck,
      total_mines,
      planets,
      tools,
      avg_luck,
      rarities,
      _id
    );
  }

  private constructor(
    public readonly totalLuck: number,
    public readonly totalMines: number,
    public readonly planets: string[],
    public readonly tools: number[],
    public readonly avgLuck: number,
    public readonly rarities: string[],
    public readonly miner: string
  ) {}

  public toJson() {
    const { totalLuck, totalMines, planets, tools, avgLuck, rarities, miner } =
      this;
    return {
      total_luck: totalLuck,
      total_mines: totalMines,
      planets,
      tools,
      avg_luck: avgLuck,
      rarities,
      miner,
    };
  }
}
