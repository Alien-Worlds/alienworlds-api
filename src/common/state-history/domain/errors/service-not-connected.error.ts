export class ServiceNotConnectedError extends Error {
  constructor() {
    super(`Client is not connected, requestBlocks cannot be called`);
  }
}
