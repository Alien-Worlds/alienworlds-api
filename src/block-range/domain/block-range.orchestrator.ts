import { NoBlockRangeFoundError } from '@common/block-range-scan/domain/errors/no-block-range.found.error';
import { config } from '@config';
import {
  WorkerMessage,
  WorkerMessageType,
} from '@core/architecture/workers/worker-message';
import { WorkerOrchestrator } from '@core/architecture/workers/worker-orchestrator';
import { injectable } from 'inversify';
import { BlockRangeScanReadTimeoutError } from './errors/block-range-scan-read-timeout.error';
import { getWorkersCount } from '@core/architecture/workers/worker.utils';
import { BlockRangeInfo } from './block-range.enums';

@injectable()
export class BlockRangeOrchestrator extends WorkerOrchestrator {
  public static Token = 'BLOCK_RANGE_ORCHESTRATOR';

  constructor() {
    const { blockrangeThreads, blockrangeInviolableThreads } = config;
    super(getWorkersCount(blockrangeThreads, blockrangeInviolableThreads));
  }

  public async init(): Promise<void> {
    // In case of an error, remove the worker and create a new one in its place
    this.addMessageHandler(
      WorkerMessageType.Error,
      async (message: WorkerMessage) => {
        const {
          pid,
          error: { name },
        } = message;
        this.removeWorker(pid);
        console.log(message.error.message);
        if (
          name !== BlockRangeScanReadTimeoutError.Token &&
          name !== NoBlockRangeFoundError.Token
        ) {
          this.addWorker();
        }

        if (this.workerCount === 0) {
          console.log(
            'All workers are offline, time to close the block_range main process'
          );
          process.exit(0);
        }
      }
    );
    // In case of a warning, log it
    this.addMessageHandler(
      WorkerMessageType.Warning,
      async (message: WorkerMessage) => console.log(message.error.message)
    );

    // When scanning a blocks range is finished,
    // recreate the thread which will start working on the next range
    this.addMessageHandler(
      WorkerMessageType.Info,
      async (message: WorkerMessage) => {
        const { pid, name } = message;

        if (name === BlockRangeInfo.ScanComplete) {
          this.removeWorker(pid);
          this.addWorker();
        }
      }
    );

    this.initWorkers();
  }
}