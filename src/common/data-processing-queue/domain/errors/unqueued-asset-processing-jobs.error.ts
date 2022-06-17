export class UnqueuedAssetProcessingJobsError extends Error {
  public static Token = 'UNQUEUED_ASSET_PROCESSING_JOBS_ERROR';
  constructor(public readonly unqueuedIds: bigint[]) {
    super(`Some of the asset processing jobs were not queued`);
    this.name = UnqueuedAssetProcessingJobsError.Token;
  }
}
