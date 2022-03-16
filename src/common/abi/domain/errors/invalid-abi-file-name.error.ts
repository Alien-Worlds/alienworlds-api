export class InvalidAbiFileNameError extends Error {
  constructor(
    public readonly filename: string,
    public readonly contract: string,
    public readonly blockNum: string
  ) {
    super(`Invalid ABI file name: ${filename}`);
  }
}
