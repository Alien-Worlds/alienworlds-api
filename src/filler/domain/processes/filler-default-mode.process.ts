import { inject, injectable } from 'inversify';
import { FillerOptions } from '../entities/filler-options';
import { GetBlockRangeUseCase } from '../use-cases/get-block-range.use-case';
import { Process } from '@core/architecture/workers/process';
import { RequestBlocksUseCase } from '@common/state-history/domain/use-cases/request-blocks.use-case';

/**
 * @class
 */
@injectable()
export class FillerDefaultModeProcess extends Process {
  public static Token = 'FILLER_DEFAULT_MODE_PROCESS';

  @inject(GetBlockRangeUseCase.Token)
  private getBlocksRangeUseCase: GetBlockRangeUseCase;

  @inject(RequestBlocksUseCase.Token)
  private requestBlocksUseCase: RequestBlocksUseCase;

  /**
   * Read raw action data from blockchain nodes and distributes
   * it through the message broker to other services/ processes.
   *
   * @async
   * @param {FillerOptions} options
   */
  public async start(options: FillerOptions) {
    const { startBlock, endBlock } = options;
    const blocksRangeResult = await this.getBlocksRangeUseCase.execute(
      startBlock,
      endBlock,
      false
    );

    if (blocksRangeResult.isFailure) {
      throw new Error('Missing blocks range');
    }
    const {
      content: { start, end },
    } = blocksRangeResult;
    const { failure: requestBlocksFailure } =
      await this.requestBlocksUseCase.execute(start, end);

    if (requestBlocksFailure) {
      throw requestBlocksFailure.error;
    }
  }
}
