import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { NFT } from '@common/nfts/domain/entities/nft';
import { NftRepository } from '@common/nfts/domain/repositories/nft.repository';
import { CollectionMismatchError } from '../errors/collection-mismatch.error';
import { AtomicTransferRepository } from '@common/atomic-transfers/domain/repositories/atomic-transfer.repository';
import { MineRepository } from '@common/mines/domain/mine.repository';
import { AtomicTransfer } from '@common/atomic-transfers/domain/entities/atomic-transfer';
import { Mine } from '@common/mines/domain/entities/mine';
import { DataSourceOperationError } from '@core/architecture/data/errors/data-source-operation.error';
import { CreateEntityFromActionUseCase } from './create-entity-from-action.use-case';
import { Failure } from '@core/architecture/domain/failure';
import { UnhandledEntityError } from '../errors/unhandled-entity.error';
import { config } from '@config';
import { InsertCachedMinesUseCase } from './insert-cached-mines.use-case';
import { ActionProcessingJob } from '@common/data-processing-queue/domain/entities/action-processing.job';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { QueueAssetProcessingUseCase } from '@common/data-processing-queue/domain/use-cases/queue-asset-processing.use-case';

/**
 * Proccess received action job.
 *
 * Depending on the type of action, the use case is to send
 * the created entity (NFT or AtomicTransfer) to the data source or
 * store it for a later bulk-upload (Mine).
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
    @inject(CreateEntityFromActionUseCase.Token)
    private createEntityFromActionUseCase: CreateEntityFromActionUseCase,
    @inject(NftRepository.Token)
    private nftRepository: NftRepository,
    @inject(AtomicTransferRepository.Token)
    private atomicTransferRepository: AtomicTransferRepository,
    @inject(MineRepository.Token)
    private minesRepository: MineRepository,
    @inject(ActionProcessingQueueService.Token)
    private actionProcessingQueueService: ActionProcessingQueueService,
    @inject(QueueAssetProcessingUseCase.Token)
    private queueAssetProcessingUseCase: QueueAssetProcessingUseCase,
    @inject(InsertCachedMinesUseCase.Token)
    private insertCachedMinesUseCase: InsertCachedMinesUseCase
  ) {}

  /**
   * Store Mine entity and message for later bulk-upload.
   *
   * @async
   * @param {Mine} entity
   * @param {Message} job
   * @returns {Result}
   */
  private async cacheMine(
    entity: Mine,
    job: ActionProcessingJob
  ): Promise<Result<void>> {
    this.actionProcessingQueueService.cacheJob(entity.transactionId, job);
    this.minesRepository.cache(entity);

    if (
      this.minesRepository.getCacheSize() >= config.mineRepositoryCacheMaxSize
    ) {
      return this.insertCachedMinesUseCase.execute();
    }

    return Result.withoutContent();
  }

  /**
   * Upload NFT entity.
   *
   * @async
   * @param {Nft} entity
   * @returns {Promise<Result>}
   */
  private async uploadNft(
    entity: NFT,
    job: ActionProcessingJob
  ): Promise<Result> {
    const { failure: uploadFailure } = await this.nftRepository.add(entity);

    if (uploadFailure) {
      if (
        uploadFailure.error instanceof DataSourceOperationError &&
        uploadFailure.error.isDuplicateError
      ) {
        // In case of a duplicate, keep the happy flow on
      } else {
        // Otherwise reject message and return a failure
        this.actionProcessingQueueService.rejectJob(job);
        return Result.withFailure(uploadFailure);
      }
    }

    await this.actionProcessingQueueService.ackJob(job);
    return Result.withoutContent();
  }

  /**
   * Upload AtomicTransfer entity. After successfully sending the entity
   * it also sends a recalc_asset message for each of the asset id.
   *
   * @async
   * @param {AtomicTransfer} entity
   * @returns {Promise<Result>}
   */
  private async uploadAtomicTransfer(
    entity: AtomicTransfer,
    job: ActionProcessingJob
  ): Promise<Result> {
    const { content, failure: uploadFailure } =
      await this.atomicTransferRepository.add(entity);

    if (uploadFailure) {
      const { error } = uploadFailure;
      if (
        error instanceof DataSourceOperationError &&
        (error.isDuplicateError || error.isInvalidDataError)
      ) {
        // In case of a duplicate or invalid data, ack message
        await this.actionProcessingQueueService.ackJob(job);
      } else {
        // Otherwise reject message
        this.actionProcessingQueueService.rejectJob(job);
      }
      // and return a failure
      return Result.withFailure(uploadFailure);
    }

    // Queue recalc_asset for each asset id
    const { failure: queueAssetsFailure } =
      await this.queueAssetProcessingUseCase.execute(content.assetIds);

    if (queueAssetsFailure) {
      return Result.withFailure(queueAssetsFailure);
    }

    await this.actionProcessingQueueService.ackJob(job);
    return Result.withoutContent();
  }

  /**
   * @async
   * @param {Message} job
   * @returns {Promise<Result>}
   */
  public async execute(job: ActionProcessingJob): Promise<Result<void>> {
    const { content: entity, failure: entityCreationFailure } =
      await this.createEntityFromActionUseCase.execute(job);

    // Ack message and return Failure if the operation failed
    // because of mismatched collection names.
    if (entityCreationFailure) {
      if (entityCreationFailure.error instanceof CollectionMismatchError) {
        this.actionProcessingQueueService.ackJob(job);
      }
      return Result.withFailure(entityCreationFailure);
    }

    // store Mine entity for later bulk-upload to the data source
    if (entity instanceof Mine) {
      return this.cacheMine(entity, job);
    }
    // handle sending NFT entity
    if (entity instanceof NFT) {
      return this.uploadNft(entity, job);
    }
    // handle sending AtomicTransfer entity
    if (entity instanceof AtomicTransfer) {
      return this.uploadAtomicTransfer(entity, job);
    }

    return Result.withFailure(
      Failure.fromError(new UnhandledEntityError(entity))
    );
  }
}
