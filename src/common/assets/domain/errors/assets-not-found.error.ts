export class AssetsNotFoundError extends Error {
  constructor() {
    super(`Assets not found`);
  }
}
