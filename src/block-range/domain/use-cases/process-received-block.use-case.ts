import { BlockRangeScanRepository } from '@common/block-range-scan/domain/repositories/block-range-scan.repository';
import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { GetBlocksResult } from '@common/state-history/domain/entities/get-blocks.result';
import { log } from '@common/state-history/domain/state-history.utils';
import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { QueueActionProcessingUseCase } from '@common/data-processing-queue/domain/use-cases/queue-action-processing.use-case';
import { config } from '@config';
import { Trace } from '@common/state-history/domain/entities/trace';

/**
 * @class
 */
@injectable()
export class ProcessReceivedBlockUseCase implements UseCase<void> {
  public static Token = 'PROCESS_RECEIVED_BLOCK_USE_CASE';

  @inject(QueueActionProcessingUseCase.Token)
  private queueActionProcessingUseCase: QueueActionProcessingUseCase;
  @inject(BlockRangeScanRepository.Token)
  private blockRangeScanRepository: BlockRangeScanRepository;

  /**
   * @async
   * @private
   * @param {Trace} trace
   * @param {bigint} blockNumber
   * @param {Date} timestamp
   */
  private async queueActionProcessingJobs(
    trace: Trace,
    blockNumber: bigint,
    timestamp: Date
  ) {
    const { id, actionTraces } = trace;

    for (const action of actionTraces) {
      const { type, receiver, act } = action;

      if (
        type === 'action_trace_v0' &&
        (act.account === config.atomicAssets.contract ||
          act.account === config.miningContract) &&
        act.account === receiver &&
        ['logmine', 'logrand', 'logtransfer', 'logburn', 'logmint'].includes(
          act.name
        )
      ) {
        const queueResult = await this.queueActionProcessingUseCase.execute(
          blockNumber,
          action,
          id,
          timestamp
        );
        // TODO How should we react if one of the actions is not queued?
        if (queueResult.isFailure) {
          log(queueResult.failure.error.name);
        }
      }
    }
  }

  /**
   * Initializes and returns a eosDAC StateReceiver object.
   *
   * @param {Block} block
   * @returns {Result<void>}
   */
  public async execute(
    scanKey: string,
    content: GetBlocksResult,
    blockRange: BlockRange
  ): Promise<Result<void>> {
    const {
      thisBlock: { blockNumber },
      traces,
      block: { timestamp },
    } = content;

    if (!(blockNumber % 1000n)) {
      log(`StateReceiver : received block ${blockNumber}`);
      log(
        `Start: ${blockRange.start}, End: ${blockRange.end}, Current: ${blockNumber}`
      );
    }

    // When processing the received block, we want to find and queue actions data
    // (for later work in the processor).
    if (traces.length > 0) {
      for (const trace of traces) {
        if (trace.type === 'transaction_trace_v0') {
          await this.queueActionProcessingJobs(trace, blockNumber, timestamp);
        }
      }
    }

    // Set the number of the currently processed block in the curently scanned
    // block range node
    const updateResult =
      await this.blockRangeScanRepository.updateScannedBlockNumber(
        scanKey,
        blockNumber
      );

    if (updateResult.isFailure) {
      return Result.withFailure(updateResult.failure);
    }

    return Result.withoutContent();
  }
}