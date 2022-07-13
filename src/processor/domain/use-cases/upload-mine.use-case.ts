import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { MineRepository } from '@common/mines/domain/mine.repository';
import { Mine } from '@common/mines/domain/entities/mine';
import { OperationErrorType } from '@core/architecture/data/errors/data-source-operation.error';
import { ActionProcessingJob } from '@common/data-processing-queue/domain/entities/action-processing.job';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { log } from '@common/state-history/domain/state-history.utils';
import { DeserializeActionJobUseCase } from './deserialize-action-job.use-case';
import { MineMessageData } from '@common/mines/data/mines.dtos';

/**
 * Uploading Mine
 *
 * @class
 */
@injectable()
export class UploadMineUseCase implements UseCase {
  public static Token = 'UPLOAD_MINE_USE_CASE';
  /**
   * @constructor
   */
  constructor(
    @inject(DeserializeActionJobUseCase.Token)
    private deserializeJobDataUseCase: DeserializeActionJobUseCase,
    @inject(MineRepository.Token)
    private minesRepository: MineRepository,
    @inject(ActionProcessingQueueService.Token)
    private actionProcessingQueueService: ActionProcessingQueueService
  ) {}

  /**
   * Create mine entity
   *
   * @private
   * @param {ActionProcessingJob} job
   * @returns {Result<Mine>}
   */
  private createMineEntity(job: ActionProcessingJob): Result<Mine> {
    const { content: data, failure: deserializationFailure } =
      this.deserializeJobDataUseCase.execute<MineMessageData>(job);

    if (deserializationFailure) {
      return Result.withFailure(deserializationFailure);
    }

    return Result.withContent(Mine.fromMessage(job, data));
  }

  /**
   * Upload Mine entity.
   *
   * @async
   * @param {Message} job
   * @returns {Promise<Result>}
   */
  public async execute(job: ActionProcessingJob): Promise<Result<void>> {
    log(`Uploading Mine`);

    const { content: entity, failure: creationFailure } =
      await this.createMineEntity(job);

    if (creationFailure) {
      this.actionProcessingQueueService.rejectJob(job);
      return Result.withFailure(creationFailure);
    }

    const { failure: insertFailure } = await this.minesRepository.insertOne(
      entity
    );

    if (insertFailure) {
      const { error } = insertFailure;

      if (error.type === OperationErrorType.Duplicate) {
        this.actionProcessingQueueService.ackJob(job);
      } else {
        this.actionProcessingQueueService.rejectJob(job);
      }
      return Result.withFailure(insertFailure);
    }

    this.actionProcessingQueueService.ackJob(job);
    return Result.withoutContent();
  }
}
