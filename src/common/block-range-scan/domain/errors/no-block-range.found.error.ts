export class NoBlockRangeFoundError extends Error {
  public static Token = 'NO_BLOCK_RANGE_FOUND_ERROR';
  constructor(public readonly scanKey) {
    super(`No block range was found for the key "${scanKey}"`);
    this.name = NoBlockRangeFoundError.Token;
  }
}
