export class AbiNotFoundError extends Error {
  constructor() {
    super(`ABI data not found`);
  }
}
