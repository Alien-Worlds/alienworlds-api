export class LastIrreversableBlockNotFoundError extends Error {
  public static Token = 'LAST_IRREVERSABLE_BLOCK_NOT_FOUND_ERROR';

  constructor() {
    super();
    this.name = LastIrreversableBlockNotFoundError.Token;
  }
}
