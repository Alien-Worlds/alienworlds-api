export class UnknownActionTypeError extends Error {
  constructor(type: string) {
    super(`Unknown action type ${type}`);
  }
}
