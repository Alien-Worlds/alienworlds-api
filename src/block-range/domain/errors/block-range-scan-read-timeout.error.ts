export class BlockRangeScanReadTimeoutError extends Error {
  public static Token = 'BLOCK_RANGE_READ_TIMEOUT_ERROR';

  constructor(error?: Error) {
    super(`The waiting limit for reading the block ranges queue exceeded. `);
    this.name = BlockRangeScanReadTimeoutError.Token;
    if (error) {
      this.message += `REASON: ${error.message}`;
      this.stack = error.stack;
    }
  }
}
