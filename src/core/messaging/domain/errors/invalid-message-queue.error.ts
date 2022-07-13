export class InvalidMessageQueueError extends Error {
  constructor(queue: string) {
    super(`Invalid message queue: ${queue}`);
  }
}
