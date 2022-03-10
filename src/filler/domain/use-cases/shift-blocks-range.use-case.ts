import { injectable } from 'inversify';
import { Result } from '../../../core/domain/result';
import { UseCase } from '../../../core/domain/use-case';
import { BlocksRange } from '../entities/blocks-range';

@injectable()
export class ShiftBlocksRangeUseCase implements UseCase<BlocksRange> {
  public static Token = 'SHIFT_BLOCKS_RANGE_USE_CASE';

  public async execute(blockRange: BlocksRange): Promise<Result<BlocksRange>> {
    const { end } = blockRange;

    return Result.withContent(BlocksRange.create(end, 0xffffffff));
  }
}
