import { config } from '@config';
import { Message } from '@core/domain/messages';
import { Serialize } from 'eosjs';
import { parseUint8ArrayToBigInt } from '../utils/parsers';

/**
 * @class
 */
export class BlocksRange<T = number | bigint> {
  private constructor(public readonly start: T, public readonly end: T) {}

  /**
   * Create instance of the BlockRange
   *
   * @static
   * @param {number=} startBlock
   * @param {number=} endBlock
   * @returns {BlocksRange}
   */
  public static create(
    startBlock?: number,
    endBlock?: number
  ): BlocksRange<number> {
    const start = isNaN(startBlock) ? config.startBlock : startBlock;
    const end = isNaN(endBlock) ? config.endBlock : endBlock;

    return new BlocksRange<number>(start, end);
  }

  /**
   * Create instance of the BlockRange based on the message content
   *
   * @static
   * @param {Message} message
   * @returns {BlocksRange}
   */
  public static fromMessage(message: Message): BlocksRange<bigint> {
    const sb = new Serialize.SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
      array: new Uint8Array(message.content),
    });

    const start = parseUint8ArrayToBigInt(sb.getUint8Array(8));
    const end = parseUint8ArrayToBigInt(sb.getUint8Array(8));

    return new BlocksRange<bigint>(start, end);
  }
}
