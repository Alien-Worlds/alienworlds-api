import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { MineRepository } from '@common/mines/domain/mine.repository';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';

/**
 * The purpose of the use case is to send cached entities to the data source
 * in one set. After the operation is performed, the set is cleared and
 * all messages assigned to the entities are properly handled (ack/reject)
 * depending on the success of the sent and the individual entity.
 *
 * @class
 */
@injectable()
export class InsertCachedMinesUseCase implements UseCase {
  public static Token = 'INSERT_CACHED_MINES_USE_CASE';

  constructor(
    @inject(ActionProcessingQueueService.Token)
    private actionProcessingQueueService: ActionProcessingQueueService,
    @inject(MineRepository.Token) private minesRepository: MineRepository
  ) {}

  /**
   * Reject the message assigned to a specific key.
   *
   * @private
   * @param {string} key
   */
  private rejectMessageByKey(key: string) {
    const { content: message, failure } =
      this.actionProcessingQueueService.getCachedJob(key);
    if (failure) {
      console.error(failure.error);
    } else {
      this.actionProcessingQueueService.rejectJob(message);
    }
  }

  /**
   * Ack the message assigned to a specific key.
   *
   * @private
   * @param {string} key
   */
  private ackMessageByKey(key: string) {
    const { content: message, failure } =
      this.actionProcessingQueueService.getCachedJob(key);
    if (failure) {
      console.error(failure.error);
    } else {
      this.actionProcessingQueueService.ackJob(message);
    }
  }

  /**
   * @async
   * @returns {Promise<Result<void>>}
   */
  public async execute(): Promise<Result<void>> {
    const insertionResult = await this.minesRepository.insertCached(true);

    if (insertionResult.failure) {
      const {
        error: {
          concernError,
          skippedEntities,
          insertedEntities,
          duplicatedEntities,
        },
      } = insertionResult.failure;

      // Reject all messages of the skipped entities
      skippedEntities.forEach(entity =>
        this.rejectMessageByKey(entity.transactionId)
      );

      // Ack all messages of the skipped entities
      duplicatedEntities.forEach(entity =>
        this.ackMessageByKey(entity.transactionId)
      );

      // Ack messages assigned to sent entities
      insertedEntities.forEach(entity =>
        this.ackMessageByKey(entity.transactionId)
      );

      // Something has gone wrong, and it's not for individual operations,
      // but for all of them. In this case, return the failure with
      // the error so that it can be handled at a higher level.
      if (concernError) {
        return Result.withFailure(insertionResult.failure);
      }
    } else {
      // Ack messages assigned to sent entities
      insertionResult.content.forEach(entity =>
        this.ackMessageByKey(entity.transactionId)
      );
    }

    return Result.withoutContent();
  }
}
