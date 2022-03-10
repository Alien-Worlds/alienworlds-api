import { Messages } from '@core/domain/messages';
import { MessageQueue } from '@core/domain/messages.types';
import { inject, injectable } from 'inversify';
import { Failure } from '../../../core/domain/failure';
import { Result } from '../../../core/domain/result';
import { UseCase } from '../../../core/domain/use-case';
import { BlocksRange } from '../entities/blocks-range';

@injectable()
export class PopulateBlockRangesUseCase extends UseCase {
  public static Token = 'POPULATE_BLOCK_RANGES_USE_CASE';

  constructor(@inject(Messages.Token) private messages: Messages) {
    super();
  }

  /**
   * Write block range as a buffer.....
   *
   * @private
   * @param {number} start
   * @param {number} end
   * @returns {Buffer}
   */
  private writeBlockRangeBuffer(start: number, end: number): Buffer {
    const startBuffer = Buffer.allocUnsafe(8);
    startBuffer.writeBigInt64BE(BigInt(start), 0);

    const endBuffer = Buffer.allocUnsafe(8);
    endBuffer.writeBigInt64BE(BigInt(end), 0);

    return Buffer.concat([startBuffer, endBuffer]);
  }

  /**
   *
   * @async
   * @param {BlockRange} blocksRange
   * @returns
   */
  public async execute(blocksRange: BlocksRange) {
    const { start: startBlock, end: endBlock } = blocksRange;

    const chunkSize = 10000;
    const chunksCount = Math.ceil((endBlock - startBlock) / chunkSize);
    const queue = [];
    let from = startBlock;
    let to = from + chunkSize;
    let i = 0;
    let messagesCount = 0;

    while (i < chunksCount) {
      process.stdout.write(
        `Sending ${messagesCount}/${chunksCount} messages\r`
      );

      if (to > endBlock) {
        to = endBlock;
        i = chunksCount;
      }

      const buffer = this.writeBlockRangeBuffer(from, to);
      queue.push(
        this.messages.send(MessageQueue.AlienWorldsBlockRange, buffer)
      );

      from += chunkSize;
      to += chunkSize;
      i++;
      messagesCount++;
    }

    try {
      await Promise.all(queue);
      console.log(`Sent ${messagesCount} messages`);
      return Result.withContent({
        sent: messagesCount,
        total: chunksCount,
      });
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
