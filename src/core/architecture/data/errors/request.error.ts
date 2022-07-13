export class RequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly details: object
  ) {
    super(`[${status}] ${message}`);
  }
}
