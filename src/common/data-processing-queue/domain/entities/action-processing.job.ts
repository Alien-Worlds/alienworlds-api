import { Serialize } from 'eosjs';
import { parseUint8ArrayToBigInt } from '@common/block-range-scan/domain/utils/parsers';
import { Message } from '@core/messaging/domain/entities/message';
import { Job } from './job';
import { ActionTrace } from '@common/actions/domain/entities/action-trace';

/**
 * Represents (action) message entity.
 *
 * @class
 */
export class ActionProcessingJob extends Job {
  /**
   *
   * @private
   * @constructor
   * @param {string} account
   * @param {string} name
   * @param {Buffer} data
   * @param {bigint} blockNumber
   * @param {Date} blockTimestamp
   * @param {bigint} globalSequence
   * @param {string} transactionId
   */
  protected constructor(
    public readonly account: string,
    public readonly name: string,
    public readonly data: Buffer,
    public readonly blockNumber: bigint,
    public readonly blockTimestamp: Date,
    public readonly globalSequence: bigint,
    public readonly transactionId: string,
    message: Message
  ) {
    super(message);
  }

  /**
   * Create ActionMessage instance based on the message content
   *
   * @static
   * @param {Message} message
   * @returns {ActionProcessingJob}
   */
  public static fromMessage(message: Message): ActionProcessingJob {
    const sb = new Serialize.SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
      array: new Uint8Array(message.content),
    });

    const blockNum = parseUint8ArrayToBigInt(sb.getUint8Array(8));
    const blockTimestampInt = Buffer.from(sb.getUint8Array(4)).readUInt32BE(0);
    const blockTimestamp = new Date(blockTimestampInt * 1000);
    const transactionId = parseUint8ArrayToBigInt(
      sb.getUint8Array(32)
    ).toString(16);
    const recvSequence = parseUint8ArrayToBigInt(sb.getUint8Array(8));
    const globalSequence = parseUint8ArrayToBigInt(sb.getUint8Array(8));
    const account = sb.getName();
    const name = sb.getName();
    const data_arr = sb.getBytes();

    return new ActionProcessingJob(
      account,
      name,
      Buffer.from(data_arr),
      BigInt(blockNum),
      blockTimestamp,
      BigInt(globalSequence),
      transactionId,
      message
    );
  }

  public static createBuffer(
    blockNumber: bigint,
    action: ActionTrace,
    traceId: string,
    timestamp: Date
  ): Buffer {
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

    return Buffer.concat([
      blockBuffer,
      timestampBuffer,
      trxIdBuffer,
      recvBuffer,
      globalBuffer,
      actionBuffer,
    ]);
  }
}
