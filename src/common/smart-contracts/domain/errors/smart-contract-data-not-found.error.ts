export class SmartContractDataNotFoundError extends Error {
  constructor(bound: string, scope: string) {
    super(`Data with ${bound} in ${scope} scope not found`);
  }
}
