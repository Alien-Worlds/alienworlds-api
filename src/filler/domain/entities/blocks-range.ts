import { config } from '@config';

/**
 * @class
 */
export class BlocksRange {
  private constructor(
    public readonly start: number,
    public readonly end: number
  ) {}

  /**
   * Create instance of the BlockRange
   *
   * @static
   * @param {number=} startBlock
   * @param {number=} endBlock
   * @returns {BlocksRange}
   */
  public static create(startBlock?: number, endBlock?: number): BlocksRange {
    const start = isNaN(startBlock) ? config.startBlock : startBlock;
    const end = isNaN(endBlock) ? config.endBlock : endBlock;

    return new BlocksRange(start, end);
  }
}
