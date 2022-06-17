export class MissingHandlersError extends Error {
  constructor() {
    super('Set handlers before calling connect()');
  }
}
