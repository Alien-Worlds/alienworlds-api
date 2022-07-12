import { ActionProcessingJob } from '@common/data-processing-queue/domain/entities/action-processing.job';
import { AssetProcessingJob } from '@common/data-processing-queue/domain/entities/asset-processing.job';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { AssetProcessingQueueService } from '@common/data-processing-queue/domain/services/asset-processing-queue.service';
import { Process } from '@core/architecture/workers/process';
import {
  WorkerMessage,
  WorkerMessageType,
} from '@core/architecture/workers/worker-message';
import { inject, injectable } from 'inversify';
import { ProcessActionUseCase } from './use-cases/process-action.use-case';
import { ProcessAssetUseCase } from './use-cases/process-asset.use-case';

/**
 * @class
 */
@injectable()
export class ProcessorProcess extends Process {
  public static Token = 'PROCESSOR_PROCESS';

  @inject(ActionProcessingQueueService.Token)
  private actionProcessingQueueService: ActionProcessingQueueService;

  @inject(AssetProcessingQueueService.Token)
  private assetProcessingQueueService: AssetProcessingQueueService;

  @inject(ProcessActionUseCase.Token)
  private processActionUseCase: ProcessActionUseCase;

  @inject(ProcessAssetUseCase.Token)
  private processAssetUseCase: ProcessAssetUseCase;

  /**
   * Set up processing job (asset and action) listeners
   *
   * @async
   */
  public async start() {
    // TODO Question... Should we create multiple (default 30) handlers?
    // for (let i = 0; i < config.processorMessageHandlerCount; i++) {
    try {
      this.actionProcessingQueueService.addJobHandler(
        async (job: ActionProcessingJob) => {
          this.processActionUseCase.execute(job);
        }
      );
      this.assetProcessingQueueService.addJobHandler(
        async (job: AssetProcessingJob) => {
          this.processAssetUseCase.execute(job);
        }
      );
    } catch (error) {
      this.sendToMainThread(
        WorkerMessage.create({
          pid: this.id,
          type: WorkerMessageType.Error,
          name: error.name,
          error,
        })
      );
    }
    // }
  }
}
