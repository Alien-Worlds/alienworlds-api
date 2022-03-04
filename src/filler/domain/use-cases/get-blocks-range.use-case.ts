import { MinesRepository } from '@common/mines/domain/mines.repository';
import { Failure } from '@core/domain/failure';
import { inject, injectable } from 'inversify';
import { Result } from '../../../core/domain/result';
import { UseCase } from '../../../core/domain/use-case';
import { BlocksRange } from '../entities/blocks-range';
import { FillerOptions } from '../entities/filler-options';

@injectable()
export class GetBlocksRangeUseCase implements UseCase<BlocksRange> {
  public static Token = 'GET_BLOCKS_RANGE_USE_CASE';

  constructor(
    @inject(MinesRepository.Token) private minesRepository: MinesRepository
  ) {}

  public async execute(options: FillerOptions): Promise<Result<BlocksRange>> {
    const { startBlock, endBlock } = options;
    if (startBlock === -1) {
      try {
        const lastBlock = await this.minesRepository.getLastBlock();
        const { blockNum } = lastBlock;
        return Result.withContent(BlocksRange.create(blockNum, endBlock));
      } catch (error) {
        return Result.withFailure(Failure.fromError(error));
      }
    } else {
      return Result.withContent(BlocksRange.create(startBlock, endBlock));
    }
  }
}
