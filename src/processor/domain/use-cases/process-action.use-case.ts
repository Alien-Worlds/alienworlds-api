import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { Failure } from '@core/architecture/domain/failure';
import { ActionProcessingJob } from '@common/data-processing-queue/domain/entities/action-processing.job';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { UploadMineUseCase } from './upload-mine.use-case';
import { UploadNftUseCase } from './upload-nft.use-case';
import { UploadAtomicTransferUseCase } from './upload-atomic-transfer.use-case';
import { config } from '@config';
import { ActionName } from '@common/actions/domain/actions.enums';
import { UnhandledActionError } from '../errors/unhandled-action.error';

/**
 * Proccess received action job.
 *
 * Depending on the type of action, the use case is to send
 * the created entity (Mine, NFT or AtomicTransfer) to the data source
 *
 * @class
 */
@injectable()
export class ProcessActionUseCase implements UseCase {
  public static Token = 'PROCESS_ACTION_USE_CASE';
  /**
   * @constructor
   */
  constructor(
    @inject(ActionProcessingQueueService.Token)
    private actionProcessingQueueService: ActionProcessingQueueService,
    @inject(UploadMineUseCase.Token)
    private uploadMineUseCase: UploadMineUseCase,
    @inject(UploadNftUseCase.Token)
    private uploadNftUseCase: UploadNftUseCase,
    @inject(UploadAtomicTransferUseCase.Token)
    private uploadAtomicTransferUseCase: UploadAtomicTransferUseCase
  ) {}

  /**
   * @async
   * @param {Message} job
   * @returns {Promise<Result>}
   */
  public async execute(job: ActionProcessingJob): Promise<Result<void>> {
    const actionLabel = `${job.account}::${job.name}`;
    const {
      atomicAssets: { contract },
    } = config;
    // TODO question: Why just "m.federation"?
    if (actionLabel === `m.federation::${ActionName.LogMine}`) {
      return this.uploadMineUseCase.execute(job);
    }

    if (actionLabel === `m.federation::${ActionName.LogRand}`) {
      return this.uploadNftUseCase.execute(job);
    }

    if (
      actionLabel === `${contract}::${ActionName.LogTransfer}` ||
      actionLabel === `${contract}::${ActionName.LogMint}` ||
      actionLabel === `${contract}::${ActionName.LogBurn}`
    ) {
      return this.uploadAtomicTransferUseCase.execute(job);
    }

    this.actionProcessingQueueService.ackJob(job);

    return Result.withFailure(
      Failure.fromError(new UnhandledActionError(actionLabel))
    );
  }
}
