import { parseToBigInt } from '@common/utils/dto.utils';
import { Message } from '@core/messaging/domain/entities/message';
import { Serialize } from 'eosjs';
import { parseUint8ArrayToBigInt } from '../utils/parsers';

/**
 * @class
 */
export class BlockRange {
  protected constructor(
    public readonly start: bigint,
    public readonly end: bigint,
    public current?: bigint
  ) {}

  /**
   * Create instance of the BlockRange
   *
   * @static
   * @param {bigint} startBlock
   * @param {bigint} endBlock
   * @param {bigint=} currentBlock
   * @returns {BlockRange}
   */
  public static create(
    startBlock: bigint | number | string,
    endBlock: bigint | number | string,
    currentBlock?: bigint | number | string
  ): BlockRange {
    const range = new BlockRange(
      parseToBigInt(startBlock),
      parseToBigInt(endBlock)
    );

    if (currentBlock) {
      range.current = parseToBigInt(currentBlock);
    }

    return range;
  }

  /**
   * Create instance of the BlockRange based on the message content
   *
   * @static
   * @param {Message} message
   * @returns {BlockRange}
   */
  public static fromMessage(message: Message): BlockRange {
    const sb = new Serialize.SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
      array: new Uint8Array(message.content),
    });

    const start = parseUint8ArrayToBigInt(sb.getUint8Array(8));
    const end = parseUint8ArrayToBigInt(sb.getUint8Array(8));

    return new BlockRange(start, end);
  }
}
