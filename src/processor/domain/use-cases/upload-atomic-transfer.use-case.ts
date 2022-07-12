import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { CollectionMismatchError } from '../errors/collection-mismatch.error';
import { AtomicTransferRepository } from '@common/atomic-transfers/domain/repositories/atomic-transfer.repository';
import { AtomicTransfer } from '@common/atomic-transfers/domain/entities/atomic-transfer';
import { DataSourceOperationError } from '@core/architecture/data/errors/data-source-operation.error';
import { Failure } from '@core/architecture/domain/failure';
import { ActionProcessingJob } from '@common/data-processing-queue/domain/entities/action-processing.job';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { QueueAssetProcessingUseCase } from '@common/data-processing-queue/domain/use-cases/queue-asset-processing.use-case';
import { log } from '@common/state-history/domain/state-history.utils';
import { DeserializeActionJobUseCase } from './deserialize-action-job.use-case';
import { AtomicTransferMessageData } from '@common/atomic-transfers/data/atomic-transfers.dtos';
import { config } from '@config';

/**
 *
 * @class
 */
@injectable()
export class UploadAtomicTransferUseCase implements UseCase {
  public static Token = 'UPLOAD_ATOMIC_TRANSFER_USE_CASE';
  /**
   * @constructor
   */
  constructor(
    @inject(AtomicTransferRepository.Token)
    private atomicTransferRepository: AtomicTransferRepository,
    @inject(ActionProcessingQueueService.Token)
    private actionProcessingQueueService: ActionProcessingQueueService,
    @inject(QueueAssetProcessingUseCase.Token)
    private queueAssetProcessingUseCase: QueueAssetProcessingUseCase,
    @inject(DeserializeActionJobUseCase.Token)
    private deserializeJobDataUseCase: DeserializeActionJobUseCase
  ) {}

  /**
   * Create AtomicTransfer entity
   *
   * @private
   * @param {ActionProcessingJob} job
   * @returns {Result<AtomicTransfer>}
   */
  private createAtomicTransferEntity(
    job: ActionProcessingJob
  ): Result<AtomicTransfer> {
    const {
      atomicAssets: { collection },
    } = config;
    const { content: deserializedData, failure: deserializationFailure } =
      this.deserializeJobDataUseCase.execute<AtomicTransferMessageData>(job);

    if (deserializationFailure) {
      return Result.withFailure(deserializationFailure);
    }

    // If the collection name is different from the one set in the config,
    // skip this message and terminate operation with a failure that
    // will be handled later
    if (deserializedData.collection_name !== collection) {
      return Result.withFailure(
        Failure.fromError(
          new CollectionMismatchError(
            deserializedData.collection_name,
            collection
          )
        )
      );
    }
    return Result.withContent(
      AtomicTransfer.fromMessage(job, deserializedData)
    );
  }

  /**
   * Upload AtomicTransfer entity. After successfully sending the entity
   * it also sends a recalc_asset message for each of the asset id.
   *
   * @async
   * @param {Message} job
   * @returns {Promise<Result>}
   */
  public async execute(job: ActionProcessingJob): Promise<Result<void>> {
    log(`Uploading AtomicTransfer`);

    const { content: entity, failure: creationFailure } =
      await this.createAtomicTransferEntity(job);

    if (creationFailure) {
      if (creationFailure.error instanceof CollectionMismatchError) {
        this.actionProcessingQueueService.ackJob(job);
      } else {
        this.actionProcessingQueueService.rejectJob(job);
      }
      return Result.withFailure(creationFailure);
    }

    const { content, failure: uploadFailure } =
      await this.atomicTransferRepository.add(entity);

    if (uploadFailure) {
      const { error } = uploadFailure;
      if (
        error instanceof DataSourceOperationError &&
        (error.isDuplicateError || error.isInvalidDataError)
      ) {
        // In case of a duplicate or invalid data, ack message
        this.actionProcessingQueueService.ackJob(job);
      } else {
        // Otherwise reject message...
        this.actionProcessingQueueService.rejectJob(job);
      }
      // ...and return a failure
      return Result.withFailure(uploadFailure);
    }

    // Queue recalc_asset for each asset id
    const { failure: queueAssetsFailure } =
      await this.queueAssetProcessingUseCase.execute(content.assetIds);

    if (queueAssetsFailure) {
      // TODO: question
      // In case of unsuccessful queuing of assets-processing jobs,
      // should we also delete the entry in the database?
      // const revertResult =
      // await this.atomicTransferRepository.remove(entity);
      this.actionProcessingQueueService.rejectJob(job);
      return Result.withFailure(queueAssetsFailure);
    }

    this.actionProcessingQueueService.ackJob(job);
    return Result.withoutContent();
  }
}
