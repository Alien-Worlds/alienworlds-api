export class NftsNotFoundError extends Error {
  constructor() {
    super(`Nfts not found`);
  }
}
