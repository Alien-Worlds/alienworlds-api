import { Serialize } from 'eosjs';
import { parseUint8ArrayToBigInt } from '@common/block-range-scan/domain/utils/parsers';
import { Message } from '@core/messaging/domain/entities/message';
import { Job } from './job';

/**
 * Represents (recalc asset) job entity.
 *
 * @class
 */
export class AssetProcessingJob extends Job {
  public static createBuffer(assetId: bigint): Buffer {
    const buffer = Buffer.allocUnsafe(8);
    buffer.writeBigInt64BE(assetId, 0);

    return Buffer.concat([buffer]);
  }

  /**
   * @static
   * @param {Message} message
   * @returns {AssetProcessingJob}
   */
  public static fromMessage(message: Message): AssetProcessingJob {
    const sb = new Serialize.SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
      array: new Uint8Array(message.content),
    });
    return new AssetProcessingJob(
      parseUint8ArrayToBigInt(sb.getUint8Array(8)),
      message
    );
  }

  /**
   * @private
   * @constructor
   */
  protected constructor(public readonly assetId: bigint, message: Message) {
    super(message);
  }
}
