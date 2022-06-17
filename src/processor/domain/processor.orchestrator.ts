import * as os from 'os';
import { injectable } from 'inversify';
import { WorkerMessageType } from '@core/architecture/workers/worker-message';
import { WorkerOrchestrator } from '@core/architecture/workers/worker-orchestrator';
import { Config, config } from '@config';
import { AbiHexFile } from 'processor/data/abi-hex.dto';

/**
 * Get the number of workers from configuration
 * or based on the number of available CPU cores.
 * The number of CPU cores is reduced by
 * a constant specified in the configuration.
 *
 * @param {Config} config
 * @returns {number}
 */
export const getProcessorWorkersCount = (config: Config) => {
  let count = config.processorThreads;
  if (count === 0 || isNaN(count)) {
    const cpus = os.cpus().length;
    count = cpus - config.processorInviolableThreads;
  }

  return count;
};

@injectable()
export class ProcessorOrchestrator extends WorkerOrchestrator {
  public static Token = 'PROCESSOR_ORCHESTRATOR';
  private abiHexFiles: AbiHexFile[];

  /**
   * @constructor
   * @param {AbiHexFile[]} abiHex
   */
  constructor(abiHex: AbiHexFile[]) {
    super(getProcessorWorkersCount(config));
    this.abiHexFiles = abiHex;
  }

  public async init(): Promise<void> {
    // In case of an error, remove the worker and create a new one in its place
    this.addMessageHandler(WorkerMessageType.Error, async message => {
      const { pid, error } = message;
      console.log({ pid, error });
      this.removeWorker(pid);
      this.addWorker(this.abiHexFiles);
    });
    // In case of a warning, log it
    this.addMessageHandler(WorkerMessageType.Warning, async message => {
      console.log(message.error);
    });

    this.initWorkers(this.abiHexFiles);
  }
}
