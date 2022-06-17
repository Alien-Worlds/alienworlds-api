export class UnhandledMessageError extends Error {
  constructor(public readonly message, public readonly error) {
    super('Received a message while no block range is being processed');
  }
}
