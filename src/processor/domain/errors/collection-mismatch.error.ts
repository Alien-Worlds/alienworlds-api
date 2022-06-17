export class CollectionMismatchError extends Error {
  constructor(actual: string, target: string) {
    super(`Collection mismatch: ${actual} != ${target}`);
  }
}
