export class AssetNotFoundError extends Error {
  constructor(public readonly assetId: bigint) {
    super(`Asset ${assetId}  not found`);
  }
}
