/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable } from 'inversify';
import { UseCase } from '@core/domain/use-case';
import { Result } from '@core/domain/result';
import { BlocksRange } from '../../../domain/entities/blocks-range';
import { FillerOptions } from '../../../domain/entities/filler-options';

@injectable()
export class GetBlocksRangeUseCase implements UseCase {
  public static Token = 'GET_BLOCKS_RANGE_USE_CASE';

  public async execute(options: FillerOptions): Promise<Result<BlocksRange>> {
    return null;
  }
}
