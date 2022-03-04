import { inject, injectable } from 'inversify';
import { Failure } from '../../../core/domain/failure';
import { Result } from '../../../core/domain/result';
import { UseCase } from '../../../core/domain/use-case';
import { BlocksRange } from '../entities/blocks-range';
import { FillerOptions } from '../entities/filler-options';
import { GetLastIrreversableBlockNumUseCase } from './get-last-irreversable-block-number.use-case';

@injectable()
export class PopulateBlockRangesUseCase extends UseCase<BlocksRange> {
  public static Token = 'REPLAY_USE_CASE';

  @inject(GetLastIrreversableBlockNumUseCase.Token)
  private getLastIrreversableBlockNumUseCase: GetLastIrreversableBlockNumUseCase;

  public async execute(
    blocksRange: BlocksRange,
    options: FillerOptions
  ): Promise<Result<BlocksRange>> {
    // const startBlock = blocksRange.start;
    const endBlock = blocksRange.end;

    // if (endBlock === 0xffffffff) {
    //     const getLastBlockNumResult = await this.getLastIrreversableBlockNumUseCase.execute();

    //     if (getLastBlockNumResult.isFailure) {
    //         return Result.withFailure(getLastBlockNumResult.failure);
    //     }
    //     endBlock = getLastBlockNumResult.content;
    // }

    // const chunk_size = 10000;
    // let from = startBlock;
    // let to = from + chunk_size; // to is not inclusive
    // let jobsCount = 0;

    // const send_promises = [];

    // while (to !== endBlock || from < to) {
    //     process.stdout.write('.');

    //     const from_buffer = Buffer.allocUnsafe(8);
    //     from_buffer.writeBigInt64BE(BigInt(from), 0);

    //     const to_buffer = Buffer.allocUnsafe(8);
    //     to_buffer.writeBigInt64BE(BigInt(to), 0);

    //     send_promises.push(
    //         new Promise(resolve => {
    //             this.amq.send(
    //                 'aw_block_range',
    //                 Buffer.concat([from_buffer, to_buffer]),
    //                 () => resolve
    //             );
    //         })
    //     );
    //     jobsCount++;

    //     from += chunk_size;
    //     to += chunk_size;

    //     if (to > endBlock) {
    //         to = endBlock;
    //     }

    //     if (from > to) {
    //         break_now = true;
    //     }

    //     if (break_now) {
    //         break;
    //     }
    // }
    // console.log(`Added ${jobsCount} jobs`);
    // await Promise.all(send_promises);

    return options.continueWithFiller
      ? Result.withContent(BlocksRange.create(endBlock, 0xffffffff))
      : Result.withFailure(Failure.withMessage('game over'));
  }
}
