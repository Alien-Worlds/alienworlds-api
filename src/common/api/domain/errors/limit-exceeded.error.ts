export class LimitExceededError extends Error {
  constructor(value: number) {
    super(`Limit maximum is ${value}`);
  }
}
