export class LimitExceededError extends Error {
  constructor(value: number) {
    super(`The specified value exceeds the limit ${value}`);
  }
}
