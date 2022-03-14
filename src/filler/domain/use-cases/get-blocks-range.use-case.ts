import { BlocksRange } from '@common/block/domain/entities/blocks-range';
import { GetLastBlockUseCase } from '@common/mines/domain/use-cases/get-last-block.use-case';
import { config } from '@config';
import { inject, injectable } from 'inversify';
import { Result } from '../../../core/domain/result';
import { UseCase } from '../../../core/domain/use-case';
import { FillerOptions } from '../entities/filler-options';
import { GetLastIrreversableBlockNumUseCase } from './get-last-irreversable-block-number.use-case';

/**
 * @class
 */
@injectable()
export class GetBlocksRangeUseCase implements UseCase<BlocksRange> {
  public static Token = 'GET_BLOCKS_RANGE_USE_CASE';

  constructor(
    @inject(GetLastBlockUseCase.Token)
    private getLastBlockUseCase: GetLastBlockUseCase,
    @inject(GetLastIrreversableBlockNumUseCase.Token)
    private getLastIrreversableBlockNumUseCase: GetLastIrreversableBlockNumUseCase
  ) {}

  /**
   * Creates and returns a BlockRange object based on the given options.
   * If an error occurs, it returns the Failure object.
   *
   * @async
   * @param {FillerOptions} options
   * @returns {Promise<Result<BlocksRange>>}
   */
  public async execute(
    options: FillerOptions
  ): Promise<Result<BlocksRange<number>>> {
    const { startBlock, endBlock, replay } = options;
    let tempStartBlock = config.startBlock;
    let tempEndBlock = config.endBlock;

    if (endBlock !== config.endBlock) {
      tempEndBlock = endBlock;
    }

    if (startBlock === -1) {
      const getLastBlockResult = await this.getLastBlockUseCase.execute();

      if (getLastBlockResult.isFailure) {
        return Result.withFailure(getLastBlockResult.failure);
      }

      const { blockNum } = getLastBlockResult.content;
      tempStartBlock = blockNum;
    } else {
      tempStartBlock = startBlock;
    }

    if (replay && endBlock === 0xffffffff) {
      const { failure, content } =
        await this.getLastIrreversableBlockNumUseCase.execute();

      if (failure) {
        return Result.withFailure(failure);
      }
      tempEndBlock = content;
    }

    return Result.withContent(BlocksRange.create(tempStartBlock, tempEndBlock));
  }
}
