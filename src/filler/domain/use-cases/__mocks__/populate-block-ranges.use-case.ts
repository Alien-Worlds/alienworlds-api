import { UseCase } from '@core/domain/use-case';
import { injectable } from 'inversify';

@injectable()
export class PopulateBlockRangesUseCase extends UseCase {
  public static Token = 'POPULATE_BLOCK_RANGES_USE_CASE';

  private writeBlockRangeBuffer() {
    return null;
  }

  public async execute() {
    return null;
  }
}
