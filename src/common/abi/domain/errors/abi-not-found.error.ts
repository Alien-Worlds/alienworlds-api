export class AbiNotFoundError extends Error {
  constructor(public readonly account: string) {
    super(`ABI not found: ${account}`);
  }
}
