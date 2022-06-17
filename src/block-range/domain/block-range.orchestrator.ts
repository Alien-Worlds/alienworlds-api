import * as os from 'os';
import { NoBlockRangeFoundError } from '@common/block-range-scan/domain/errors/no-block-range.found.error';
import { Config, config } from '@config';
import {
  WorkerMessage,
  WorkerMessageType,
} from '@core/architecture/workers/worker-message';
import { WorkerOrchestrator } from '@core/architecture/workers/worker-orchestrator';
import { injectable } from 'inversify';
import { BlockRangeScanReadTimeoutError } from './use-cases/errors/block-range-scan-read-timeout.error';

/**
 * Get the number of workers from configuration
 * or based on the number of available CPU cores.
 * The number of CPU cores is reduced by
 * a constant specified in the configuration.
 *
 * @param {Config} config
 * @returns {number}
 */
export const getWorkersCount = (config: Config) => {
  let count = config.blockrangeThreads;
  if (count === 0 || isNaN(count)) {
    const cpus = os.cpus().length;
    count = cpus - config.blockrangeInviolableThreads;
  }

  return count;
};

@injectable()
export class BlockRangeOrchestrator extends WorkerOrchestrator {
  public static Token = 'BLOCK_RANGE_ORCHESTRATOR';

  constructor() {
    super(getWorkersCount(config));
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
        console.log(message.error);
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
      async (message: WorkerMessage) => console.log(message.error)
    );
    // In case of a warning, log it
    this.addMessageHandler(WorkerMessageType.Warning, async message => {
      console.log(message.error);
    });

    this.initWorkers();
  }
}
