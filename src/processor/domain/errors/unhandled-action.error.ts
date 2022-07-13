export class UnhandledActionError extends Error {
  constructor(label: string) {
    super(`Unhandled action with label "${label}"`);
  }
}
