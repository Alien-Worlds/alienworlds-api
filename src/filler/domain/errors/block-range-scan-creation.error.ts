export class BlockRangeScanCreationError extends Error {
  public static Token = 'BLOCK_RANGE_SCAN_CREATION_ERROR';

  constructor(start: bigint, end: bigint, error: Error) {
    super(`Could not create scan nodes for block range (${start}-${end})`);
    this.name = BlockRangeScanCreationError.Token;
    this.message += `\n${error.message}`;
    this.stack = error.stack;
  }
}
