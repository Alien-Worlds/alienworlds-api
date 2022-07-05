import { BlockRangeScanRepository } from '@common/block-range-scan/domain/repositories/block-range-scan.repository';
import { RequestBlocksUseCase } from '@common/state-history/domain/use-cases/request-blocks.use-case';
import { StartNextScanUseCase } from '@common/block-range-scan/domain/use-cases/start-next-scan.use-case';
import { Process } from '@core/architecture/workers/process';
import {
  WorkerMessage,
  WorkerMessageType,
} from '@core/architecture/workers/worker-message';
import { inject, injectable } from 'inversify';
import { BlockRangeScanReadTimeoutError } from './errors/block-range-scan-read-timeout.error';

@injectable()
export class BlockRangeProcess extends Process {
  public static Token = 'BLOCK_RANGE_PROCESS';

  @inject(StartNextScanUseCase.Token)
  private startNextScanUseCase: StartNextScanUseCase;

  @inject(RequestBlocksUseCase.Token)
  private requestBlocksUseCase: RequestBlocksUseCase;

  @inject(BlockRangeScanRepository.Token)
  private blockRangeScanRepository: BlockRangeScanRepository;

  private async waitUntilBlockRangesAreSet(scanKey: string, maxAttempts = 10) {
    return new Promise((resolve, reject) => {
      let attempt = 1;
      const interval = setInterval(async () => {
        const { content: hasUnscannedNodes, failure } =
          await this.blockRangeScanRepository.hasUnscannedNodes(scanKey);

        if (hasUnscannedNodes) {
          clearInterval(interval);
          return resolve(true);
        }

        if (++attempt === maxAttempts) {
          reject(
            new BlockRangeScanReadTimeoutError(failure ? failure.error : null)
          );
          clearInterval(interval);
        }
      }, 1000);
    });
  }

  /**
   *
   */
  public async start(scanKey: string) {
    await this.waitUntilBlockRangesAreSet(scanKey);

    const { content, failure: startNextScanFailure } =
      await this.startNextScanUseCase.execute(scanKey);

    if (startNextScanFailure) {
      this.sendToMainThread(
        WorkerMessage.create({
          pid: this.id,
          type: WorkerMessageType.Error,
          name: startNextScanFailure.error.name,
          error: startNextScanFailure.error,
        })
      );
      return;
    }

    const { start, end } = content;
    const { failure: processFailure } = await this.requestBlocksUseCase.execute(
      start,
      end
    );

    if (processFailure) {
      this.sendToMainThread(
        WorkerMessage.create({
          pid: this.id,
          type: WorkerMessageType.Error,
          name: processFailure.error.name,
          error: processFailure.error,
        })
      );
      return;
    }
  }
}
