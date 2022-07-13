import { Serialize } from 'eosjs';
import { ActionTrace } from '@common/actions/domain/entities/action-trace';

export class ActionProcessingJobMessage {
  public static create(
    blockNumber: bigint,
    action: ActionTrace,
    traceId: string,
    timestamp: Date
  ): ActionProcessingJobMessage {
    const sb_action = new Serialize.SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
    });

    sb_action.pushName(action.act.account);
    sb_action.pushName(action.act.name);
    sb_action.pushBytes(action.act.data);

    const blockBuffer = Buffer.allocUnsafe(8);
    blockBuffer.writeBigInt64BE(BigInt(blockNumber), 0);
    const timestampBuffer = Buffer.alloc(4);
    timestampBuffer.writeUInt32BE(timestamp.getTime() / 1000, 0);
    const trxIdBuffer = Buffer.from(traceId, 'hex');
    const recvBuffer = Buffer.allocUnsafe(8);
    recvBuffer.writeBigInt64BE(BigInt(action.receipt.recvSequence), 0);
    const globalBuffer = Buffer.allocUnsafe(8);
    globalBuffer.writeBigInt64BE(BigInt(action.receipt.globalSequence), 0);

    const actionBuffer = Buffer.from(sb_action.array);

    return new ActionProcessingJobMessage(
      Buffer.concat([
        blockBuffer,
        timestampBuffer,
        trxIdBuffer,
        recvBuffer,
        globalBuffer,
        actionBuffer,
      ])
    );
  }

  private constructor(public readonly buffer: Buffer) {}
}
