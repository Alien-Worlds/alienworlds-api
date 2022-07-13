export class UndefinedMessageRepositoryError extends Error {
  constructor(queue: string) {
    super(`Undefined message repository for queue: ${queue}`);
  }
}
