import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { MineLuck } from './entities/mine-luck';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class MineLuckRepository {
  public static Token = 'MINE_LUCK_REPOSITORY';

  public abstract getMineLuck(
    from: string,
    to: string
  ): Promise<Result<MineLuck[]>>;
}
