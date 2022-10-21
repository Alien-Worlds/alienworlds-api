import { Mine, MineDocument } from '@alien-worlds/alienworlds-api-common';
import { Repository, Result } from '@alien-worlds/api-core';
import { injectable } from '@alien-worlds/api-core';
import { MineLuck } from '../entities/mine-luck';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class MineLuckRepository extends Repository<
  Mine,
  MineDocument
> {
  public static Token = 'MINE_LUCK_REPOSITORY';

  public abstract listMineLuck(
    from: string,
    to: string
  ): Promise<Result<MineLuck[]>>;
}
