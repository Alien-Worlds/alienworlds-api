export class BlockNumberOutOfRangeError extends Error {
  constructor(public readonly blockNumber, public readonly scanKey) {
    super(
      `Block number ${blockNumber} is out of range or is assigned to a different key than "${scanKey}"`
    );
  }
}
