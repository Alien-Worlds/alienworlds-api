import { inject, injectable } from 'inversify';
import { Process } from '@core/architecture/workers/process';
import { WorkerMessage } from '@core/architecture/workers/worker-message';
import { VerifyUnscannedBlockRangeUseCase } from './use-cases/verify-unscanned-block-range.use-case';
import { StartBlockRangeScanUseCase } from './use-cases/start-block-range-scan.use-case';

@injectable()
export class BlockRangeProcess extends Process {
  public static Token = 'BLOCK_RANGE_PROCESS';

  @inject(StartBlockRangeScanUseCase.Token)
  private startBlockRangeScanUseCase: StartBlockRangeScanUseCase;

  @inject(VerifyUnscannedBlockRangeUseCase.Token)
  private verifyUnscannedBlockRangeUseCase: VerifyUnscannedBlockRangeUseCase;

  /**
   *
   * @param {scanKey} scanKey
   * @returns
   */
  public async start(scanKey: string) {
    // First, check if there are unscanned block ranges in the source matching the given scan key
    const { failure: verificationFailure } =
      await this.verifyUnscannedBlockRangeUseCase.execute(scanKey);

    // If there are no unscanned block ranges, send a message to the orchestorator so it can close this process
    if (verificationFailure) {
      this.sendToMainThread(
        WorkerMessage.fromError(this.id, verificationFailure.error)
      );
      return;
    }

    // Start a block range scan, first find the unscanned block range,
    // connect to the state hostory plugin and process the received data
    // (any errors will be sent to the orchestrator)
    this.startBlockRangeScanUseCase.execute(scanKey);
  }
}
