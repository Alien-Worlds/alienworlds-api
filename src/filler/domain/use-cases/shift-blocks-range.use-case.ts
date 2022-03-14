import { BlocksRange } from '@common/block/domain/entities/blocks-range';
import { injectable } from 'inversify';
import { Result } from '../../../core/domain/result';
import { UseCase } from '../../../core/domain/use-case';

/**
 * Prepare the BlockRange to continue a filler after the replay
 * has been scheduled instead of exiting the process.
 *
 * @class
 */
@injectable()
export class ShiftBlocksRangeUseCase implements UseCase<BlocksRange<number>> {
  public static Token = 'SHIFT_BLOCKS_RANGE_USE_CASE';

  /**
   * Returns a new block range - where the upper limit is 0xffffffff -
   * following the given one.
   *
   * @param {BlocksRange} blockRange
   * @returns {Promise<Result<BlocksRange>>}
   */
  public execute(blockRange: BlocksRange<number>): Result<BlocksRange<number>> {
    const { end } = blockRange;

    return Result.withContent(BlocksRange.create(end, 0xffffffff));
  }
}
