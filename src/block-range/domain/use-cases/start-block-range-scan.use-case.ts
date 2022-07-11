import { log } from '@common/state-history/domain/state-history.utils';
import { RequestBlocksUseCase } from '@common/state-history/domain/use-cases/request-blocks.use-case';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { WorkerMessage } from '@core/architecture/workers/worker-message';
import { WorkerOrchestrator } from '@core/architecture/workers/worker-orchestrator';
import { inject, injectable } from 'inversify';
import { StartNextScanUseCase } from '@common/block-range-scan/domain/use-cases/start-next-scan.use-case';

/**
 * @class
 */
@injectable()
export class StartBlockRangeScanUseCase implements UseCase<void> {
  public static Token = 'START_BLOCK_RANGE_SCAN_USE_CASE';

  @inject(StartNextScanUseCase.Token)
  private startNextScanUseCase: StartNextScanUseCase;

  @inject(RequestBlocksUseCase.Token)
  private requestBlocksUseCase: RequestBlocksUseCase;

  /**
   *
   *
   * @returns {Result<void>}
   */
  public async execute(scanKey: string): Promise<Result<void>> {
    log('Start block range scan');

    // Find the next unscanned block range matching the given scan key
    const { content: unscannedBlockRange, failure: startNextScanFailure } =
      await this.startNextScanUseCase.execute(scanKey);

    // There must have been an error if no block range was found,
    // then send the error to the orchestrator
    if (startNextScanFailure) {
      WorkerOrchestrator.sendToOrchestrator(
        WorkerMessage.fromError(process.pid, startNextScanFailure.error)
      );
      return Result.withoutContent();
    }

    // Start receiving data from the block range
    // Note: handlers are set in ioc.config file
    const { start, end } = unscannedBlockRange;
    log(`Found unscanned range: ${start}-${end}`);
    const { failure: requestFailure } = await this.requestBlocksUseCase.execute(
      start,
      end
    );

    // In case of an error sending the request, forward it to the orchestrator
    if (requestFailure) {
      WorkerOrchestrator.sendToOrchestrator(
        WorkerMessage.fromError(process.pid, requestFailure.error)
      );
    }

    return Result.withoutContent();
  }
}
