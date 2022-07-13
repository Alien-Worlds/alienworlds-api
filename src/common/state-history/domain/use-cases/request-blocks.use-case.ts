import { inject, injectable } from 'inversify';
import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { StateHistoryService } from '@common/state-history/domain/state-history.service';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';

/**
 * @class
 */
@injectable()
export class RequestBlocksUseCase implements UseCase<void> {
  public static Token = 'REQUEST_BLOCKS_USE_CASE';

  /**
   * @constructor
   */
  constructor(
    @inject(StateHistoryService.Token)
    private stateHistoryService: StateHistoryService
  ) {}

  /**
   *
   * @param {bigint} startBlock
   * @param {bigint} endBlock
   * @returns {Result<void>}
   */
  public async execute(
    startBlock: bigint,
    endBlock: bigint
  ): Promise<Result<void>> {
    const { failure: connectionFailure } =
      await this.stateHistoryService.connect();

    if (connectionFailure) {
      return Result.withFailure(connectionFailure);
    }

    return this.stateHistoryService.requestBlocks(
      BlockRange.create(startBlock, endBlock),
      { shouldFetchDeltas: true, shouldFetchTraces: true }
    );
  }
}
