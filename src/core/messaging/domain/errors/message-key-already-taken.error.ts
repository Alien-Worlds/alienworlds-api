export class MessageKeyAlreadyTakenError extends Error {
  constructor(key: string) {
    super(`Message key is already taken: ${key}`);
  }
}
