export class DuplicateBlockRangeScanError extends Error {
  public static Token = 'DUPLICATE_BLOCK_RANGE_SCAN_ERROR';

  constructor(scanKey: string, start: bigint, end: bigint) {
    super(
      `Canceling a scan. There is already a block range (${start}-${end}) scan entry in the database with the selected key "${scanKey}". Please select a new unique key.`
    );
    this.name = DuplicateBlockRangeScanError.Token;
  }
}
