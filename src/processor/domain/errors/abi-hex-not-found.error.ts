export class AbiHexNotFoundError extends Error {
  constructor(public readonly account: string) {
    super(`ABI hex data not found: ${account}`);
  }
}
