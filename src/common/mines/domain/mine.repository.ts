import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { Mine } from './entities/mine';
import { InsertManyError } from './errors/insert-many.error';
import { InsertError } from './errors/insert.error';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class MineRepository {
  public static Token = 'MINE_REPOSITORY';

  public abstract getLastBlock(): Promise<Result<Mine>>;
  public abstract cache(mine: Mine): void;
  public abstract getCachedMines(): Mine[];
  public abstract getCacheSize(): number;
  public abstract clearCache(): void;
  public abstract insertOne(
    mines: Mine
  ): Promise<Result<Mine, InsertError<Mine>>>;
  public abstract insertMany(
    mines: Mine[]
  ): Promise<Result<Mine[], InsertManyError<Mine>>>;
  public abstract insertCached(
    shouldClearCache?: boolean
  ): Promise<Result<Mine[], InsertManyError<Mine>>>;
}
