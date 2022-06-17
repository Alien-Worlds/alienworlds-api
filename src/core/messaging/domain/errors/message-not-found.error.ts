export class MessageNotFoundError extends Error {
  constructor(key: string) {
    super(`Message not found by key: ${key}`);
  }
}
