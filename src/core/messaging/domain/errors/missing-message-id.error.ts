export class MissingMessageIdError extends Error {
  constructor() {
    super('No message ID');
  }
}
