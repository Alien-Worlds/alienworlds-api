import { inject, injectable } from 'inversify';
import { FillerOptions } from '../entities/filler-options';
import { Process } from '@core/architecture/workers/process';
import { RequestBlocksUseCase } from '@common/state-history/domain/use-cases/request-blocks.use-case';

/**
 * @class
 */
@injectable()
export class FillerTestModeProcess extends Process {
  public static Token = 'FILLER_TEST_MODE_PROCESS';

  @inject(RequestBlocksUseCase.Token)
  private requestBlocksUseCase: RequestBlocksUseCase;

  /**
   * @async
   * @param {FillerOptions} options
   */
  public async start(options: FillerOptions) {
    const { startBlock } = options;

    const { failure: requestBlocksFailure } =
      await this.requestBlocksUseCase.execute(startBlock, startBlock + 1n);

    if (requestBlocksFailure) {
      throw requestBlocksFailure.error;
    }
  }
}
