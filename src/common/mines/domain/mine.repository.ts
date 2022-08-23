import { QueryModel } from '@core/architecture/domain/query-model';
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

  public abstract listMines(model: QueryModel): Promise<Result<Mine[]>>;
  public abstract getLastBlock(): Promise<Result<Mine>>;
  public abstract insertOne(
    mines: Mine
  ): Promise<Result<Mine, InsertError<Mine>>>;
  public abstract insertMany(
    mines: Mine[]
  ): Promise<Result<Mine[], InsertManyError<Mine>>>;
}
