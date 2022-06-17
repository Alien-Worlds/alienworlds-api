export class UnhandledBlockRequestError extends Error {
  constructor(blockRange) {
    super(
      `Error sending the block_range request ${blockRange.key}. The current request was not completed or canceled.`
    );
  }
}
