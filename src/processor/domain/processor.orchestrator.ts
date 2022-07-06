import { injectable, unmanaged } from 'inversify';
import { WorkerMessageType } from '@core/architecture/workers/worker-message';
import { WorkerOrchestrator } from '@core/architecture/workers/worker-orchestrator';
import { config } from '@config';
import { AbiHexFile } from 'processor/data/abi-hex.dto';
import { getWorkersCount } from '@core/architecture/workers/worker.utils';

@injectable()
export class ProcessorOrchestrator extends WorkerOrchestrator {
  public static Token = 'PROCESSOR_ORCHESTRATOR';
  private abiHexFiles: AbiHexFile[];

  /**
   * @constructor
   * @param {AbiHexFile[]} abiHex
   */
  constructor(@unmanaged() abiHex: AbiHexFile[]) {
    const { processorThreads, processorInviolableThreads } = config;
    super(getWorkersCount(processorThreads, processorInviolableThreads));
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
