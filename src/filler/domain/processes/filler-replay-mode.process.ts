import { inject, injectable } from 'inversify';
import { FillerOptions } from '../entities/filler-options';
import { GetBlockRangeUseCase } from '../use-cases/get-block-range.use-case';
import { Process } from '@core/architecture/workers/process';
import { CreateBlockRangeScanUseCase } from '../use-cases/create-block-range-scan.use-case';
import { config } from '@config';
import { BlockRangeScanCreationError } from '../errors/block-range-scan-creation.error';
import { DuplicateBlockRangeScanError } from '../errors/duplicate-block-range-scan.error';

/**
 * @class
 */
@injectable()
export class FillerReplayModeProcess extends Process {
  public static Token = 'FILLER_REPLAY_MODE_PROCESS';

  @inject(GetBlockRangeUseCase.Token)
  private getBlocksRangeUseCase: GetBlockRangeUseCase;

  @inject(CreateBlockRangeScanUseCase.Token)
  private createBlockRangeScanUseCase: CreateBlockRangeScanUseCase;

  /**
   * Read raw action data from blockchain nodes and distributes
   * it through the message broker to other services/ processes.
   *
   * @async
   * @param {FillerOptions} options
   */
  public async start(options: FillerOptions) {
    const {
      blockRangeScan: { scanKey },
    } = config;
    const { startBlock, endBlock } = options;
    const blocksRangeResult = await this.getBlocksRangeUseCase.execute(
      startBlock,
      endBlock,
      true
    );

    if (blocksRangeResult.isFailure) {
      throw new Error('Missing blocks range');
    }

    const {
      content: { start, end },
    } = blocksRangeResult;

    const createScanResult = await this.createBlockRangeScanUseCase.execute(
      scanKey,
      start,
      end
    );

    if (createScanResult.isFailure) {
      const {
        failure: {
          error: { message, name },
        },
      } = createScanResult;
      if (name === DuplicateBlockRangeScanError.Token) {
        this.stop(scanKey, startBlock, endBlock, message);
      }
      throw new BlockRangeScanCreationError(
        startBlock,
        endBlock,
        createScanResult.failure.error
      );
    }

    this.stop(scanKey, startBlock, endBlock);
  }

  public async stop(
    scanKey: string,
    startBlock: bigint,
    endBlock: bigint,
    message?: string
  ) {
    console.log(
      message ||
        `Scan nodes for the block range (${startBlock}-${endBlock}) with key "${scanKey}" have been created`
    );
    process.exit(0);
  }
}
