import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { GetLastBlockUseCase } from '@common/mines/domain/use-cases/get-last-block.use-case';
import { config } from '@config';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { GetLastIrreversableBlockNumUseCase } from './get-last-irreversable-block-number.use-case';

/**
 * @class
 */
@injectable()
export class GetBlockRangeUseCase implements UseCase<BlockRange> {
  public static Token = 'GET_BLOCK_RANGE_USE_CASE';

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
   * @returns {Promise<Result<BlockRange>>}
   */
  public async execute(
    startBlock: bigint,
    endBlock: bigint,
    replay: boolean
  ): Promise<Result<BlockRange>> {
    let tempStartBlock = config.startBlock;
    let tempEndBlock = config.endBlock;

    if (endBlock && endBlock !== config.endBlock) {
      tempEndBlock = endBlock;
    }
    if (startBlock === -1n) {
      const getLastBlockResult = await this.getLastBlockUseCase.execute();

      if (getLastBlockResult.isFailure) {
        return Result.withFailure(getLastBlockResult.failure);
      }

      const { blockNumber: blockNum } = getLastBlockResult.content;
      tempStartBlock = blockNum;
    } else if (startBlock) {
      tempStartBlock = startBlock;
    }
    if (replay && endBlock === BigInt(0xffffffff)) {
      const { failure, content } =
        await this.getLastIrreversableBlockNumUseCase.execute();

      if (failure) {
        return Result.withFailure(failure);
      }
      tempEndBlock = content;
    }
    return Result.withContent(BlockRange.create(tempStartBlock, tempEndBlock));
  }
}
