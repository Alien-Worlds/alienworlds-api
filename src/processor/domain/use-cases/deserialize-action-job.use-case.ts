/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject, injectable } from 'inversify';

import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { GetMostRecentAbiHexUseCase } from '../../domain/use-cases/get-most-recent-abi-hex.use-case';
import { ParseDataToJsonUseCase } from '@common/abi/domain/use-cases/parse-data-to-json.use-case';
import { ActionProcessingJob } from '@common/data-processing-queue/domain/entities/action-processing.job';
import { UploadAbiHexUseCase } from './upload-abi-hex.use-case';

/**
 * @class
 */
@injectable()
export class DeserializeActionJobUseCase implements UseCase {
  public static Token = 'DESERIALIZE_ACTION_JOB_USE_CASE';

  /**
   *
   * @param {GetMostRecentAbiHexUseCase} getMostRecentAbiHexUseCase
   * @param {UploadAbiHexUseCase} uploadAbiHexUseCase
   * @param {ParseDataToJsonUseCase} parseDataToJsonUseCase
   */
  constructor(
    @inject(GetMostRecentAbiHexUseCase.Token)
    private getMostRecentAbiHexUseCase: GetMostRecentAbiHexUseCase,
    @inject(UploadAbiHexUseCase.Token)
    private uploadAbiHexUseCase: UploadAbiHexUseCase,
    @inject(ParseDataToJsonUseCase.Token)
    private parseDataToJsonUseCase: ParseDataToJsonUseCase
  ) {}

  /**
   * Get abi in json format.
   *
   * @private
   * @param {ActionProcessingJob} job
   * @param {boolean} fromCurrentBlock
   * @returns {Result<JobDataType>}
   */
  protected deserializeJobData<JobDataType>(
    job: ActionProcessingJob,
    fromCurrentBlock: boolean
  ): Result<JobDataType> {
    const { account, name, blockNumber, data } = job;

    const { content: recentAbi, failure: getMostRecentAbiFailure } =
      this.getMostRecentAbiHexUseCase.execute(
        account,
        blockNumber,
        fromCurrentBlock
      );

    if (getMostRecentAbiFailure) {
      return Result.withFailure(getMostRecentAbiFailure);
    }

    // upload ABI
    if (recentAbi.hasChanged) {
      const uploadAbiResult = this.uploadAbiHexUseCase.execute(
        account,
        recentAbi.data.hex
      );

      if (uploadAbiResult.isFailure) {
        return Result.withFailure(uploadAbiResult.failure);
      }
    }

    // parse message data to json
    const { content: json, failure: parseToJsonFailure } =
      this.parseDataToJsonUseCase.execute(account, name, data);

    if (parseToJsonFailure) {
      return Result.withFailure(parseToJsonFailure);
    }

    return Result.withContent(JSON.parse(json) as JobDataType);
  }

  /**
   * Return abi as json. It tries without block restriction first.
   * If it fails, it tries to perform operations on the current block only.
   *
   * @param {ActionMessage} job
   * @returns {Result<JobDataType>}
   */
  public execute<JobDataType>(job: ActionProcessingJob): Result<JobDataType> {
    const deserializeResult = this.deserializeJobData<JobDataType>(job, false);

    if (deserializeResult.isFailure) {
      return this.deserializeJobData<JobDataType>(job, true);
    }

    return Result.withContent(deserializeResult.content);
  }
}
