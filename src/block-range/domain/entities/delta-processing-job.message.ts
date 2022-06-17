import { DeltaRow } from '@common/state-history/domain/entities/delta';

export class DeltaProcessingJobMessage {
  public static create(
    row: DeltaRow,
    blockNumber: bigint,
    timestamp: Date,
    sequence: number
  ): DeltaProcessingJobMessage {
    const { present, data } = row;
    const ts = Math.floor(timestamp.getTime() / 1000);
    const timestampBuffer = Buffer.alloc(4);
    timestampBuffer.writeUInt32BE(ts, 0);
    const blockBuffer = Buffer.allocUnsafe(8);
    blockBuffer.writeBigInt64BE(BigInt(blockNumber), 0);
    // add a sequence, 32 bit block number should be enough
    const sequenceBuffer = Buffer.allocUnsafe(12);
    sequenceBuffer.fill(0);
    sequenceBuffer.writeBigInt64BE(BigInt(blockNumber), 1);
    sequenceBuffer.writeUInt16BE(sequence, 10);

    const presentBuffer = Buffer.from([Number(present)]);
    return new DeltaProcessingJobMessage(
      Buffer.concat([
        blockBuffer,
        sequenceBuffer.slice(4),
        presentBuffer,
        timestampBuffer,
        Buffer.from(data),
      ])
    );
  }

  private constructor(public readonly buffer: Buffer) {}
}
