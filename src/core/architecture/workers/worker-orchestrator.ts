import { Serializable } from 'child_process';
import cluster from 'cluster';
import { injectable, unmanaged } from 'inversify';
import { WorkerMessage, WorkerMessageHandler } from './worker-message';

@injectable()
export class WorkerOrchestrator {
  public static sendToOrchestrator(message: WorkerMessage) {
    try {
      process.send(message.toJson());
    } catch (error) {
      console.log(error);
      //
    }
  }

  private workerMaxCount;
  private workersByPid = new Map<number, cluster.Worker>();
  private handlersByMessageType = new Map<string, WorkerMessageHandler>();

  constructor(@unmanaged() workerMaxCount: number) {
    this.workerMaxCount = workerMaxCount;
  }

  public get workerCount() {
    return this.workersByPid.size;
  }

  public initWorkers(data?: string | number | boolean | object) {
    for (let i = 0; i < this.workerMaxCount; i++) {
      this.createWorker(data);
    }
  }

  public addMessageHandler(type: string, handler: WorkerMessageHandler) {
    this.handlersByMessageType.set(type, handler);
  }

  public sendToWorker(pid: number, message: Serializable): void {
    const worker = this.workersByPid.get(pid);

    if (worker) {
      worker.send(message);
    } else {
      // worker not defined with given id
    }
  }

  public addWorker(data?: string | number | boolean | object): void {
    if (this.workersByPid.size < this.workerMaxCount) {
      this.createWorker(data);
    }
  }

  public removeWorker(pid: number): void {
    const worker = this.workersByPid.get(pid);

    if (worker) {
      worker.kill();
      this.workersByPid.delete(pid);
    }
  }

  private async onWorkerMessage(message: WorkerMessage): Promise<void> {
    const worker = this.workersByPid.get(message.pid);
    const handler = this.handlersByMessageType.get(message.type);

    if (worker) {
      if (handler) {
        await handler(message);
      }
    } else {
      //worker not defined
    }
  }

  private async createWorker(
    data?: string | number | boolean | object
  ): Promise<void> {
    const worker = cluster.fork();
    worker.on('message', async message => this.onWorkerMessage(message));
    this.workersByPid.set(worker.process.pid, worker);
    if (data) {
      worker.send(data);
    }
  }
}
