import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { GetBlocksResult } from '@common/state-history/domain/entities/get-blocks.result';
import { log } from '@common/state-history/domain/state-history.utils';
import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { QueueActionProcessingUseCase } from '@common/data-processing-queue/domain/use-cases/queue-action-processing.use-case';

/**
 * @class
 */
@injectable()
export class ProcessReceivedBlockUseCase implements UseCase<void> {
  public static Token = 'PROCESS_RECEIVED_BLOCK_USE_CASE';

  /**
   * @constructor
   */
  constructor(
    @inject(QueueActionProcessingUseCase.Token)
    private queueActionProcessingUseCase: QueueActionProcessingUseCase
  ) {}

  /**
   * Initializes and returns a eosDAC StateReceiver object.
   *
   * @param {Block} block
   * @returns {Result<void>}
   */
  public async execute(
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

    if (traces.length > 0) {
      for (const trace of traces) {
        const { type, id, actionTraces } = trace;
        if (type === 'transaction_trace_v0') {
          for (const action of actionTraces) {
            const queueResult = await this.queueActionProcessingUseCase.execute(
              blockNumber,
              action,
              id,
              timestamp
            );
            // How should we react if one of the actions is not queued?
            if (queueResult.isFailure) {
              log(queueResult.failure.error.name);
            }
          }
        }
      }
    }

    return Result.withoutContent();
  }
}
