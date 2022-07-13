export class UnhandledEntityError extends Error {
  constructor(entity: unknown) {
    super(`Unhandled entity type: ${entity.constructor.name}`);
  }
}
