export class UnhandledMessageTypeError extends Error {
  constructor(public readonly type) {
    super(`Unhandled message type: ${type}`);
  }
}
