import config from '../../../config';

export class BlocksRange {
  private constructor(
    public readonly start: number,
    public readonly end: number
  ) {}

  public static create(startBlock?: number, endBlock?: number): BlocksRange {
    const start = startBlock || config.startBlock;
    const end = endBlock || config.startBlock;

    return new BlocksRange(start, end);
  }
}
