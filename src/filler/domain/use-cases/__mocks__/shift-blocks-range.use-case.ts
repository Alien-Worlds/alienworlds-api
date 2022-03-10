import { UseCase } from '@core/domain/use-case';
import { injectable } from 'inversify';

@injectable()
export class ShiftBlocksRangeUseCase implements UseCase {
  public static Token = 'SHIFT_BLOCKS_RANGE_USE_CASE';

  public async execute() {
    return null;
  }
}
