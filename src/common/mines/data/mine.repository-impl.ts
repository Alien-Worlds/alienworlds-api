import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { DataSourceBulkWriteError } from '@core/architecture/data/errors/data-source-bulk-write.error';
import { Mine } from '../domain/entities/mine';
import { InsertManyError } from '../domain/errors/insert-many.error';
import { MineRepository } from '../domain/mine.repository';
import { MineMongoSource } from './data-sources/mine.mongo.source';
import { DataSourceOperationError } from '@core/architecture/data/errors/data-source-operation.error';
import { InsertError } from '../domain/errors/insert.error';
import { QueryModel } from '@core/architecture/domain/query-model';
import { MongoFindQueryParams } from '@core/storage/data/mongo.types';
import { MineDocument } from './mines.dtos';

/**
 * @class
 */
export class MineRepositoryImpl implements MineRepository {
  /**
   * @constructor
   * @param {MineMongoSource} minesMongoSource
   */
  constructor(private minesMongoSource: MineMongoSource) {}

  public async getMines(
    model: QueryModel<MongoFindQueryParams<MineDocument>>
  ): Promise<Result<Mine[], Error>> {
    try {
      const { options, filter } = model.toQueryParams();
      const dtos = await this.minesMongoSource.find(filter, options);
      return Result.withContent(dtos.map(Mine.fromDto));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Gets the last block indexed
   *
   * @async
   * @returns {Promise<Result<Mine>>}
   */
  public async getLastBlock(): Promise<Result<Mine>> {
    try {
      const dto = await this.minesMongoSource.findLastBlock();
      return Result.withContent(Mine.fromDto(dto));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * @async
   * @param {Mine} mine
   * @returns {Promise<Result<Mine>}
   */
  public async insertOne(mine: Mine): Promise<Result<Mine, InsertError<Mine>>> {
    try {
      await this.minesMongoSource.insert(mine.toDto());
    } catch (dataSourceError) {
      const { type, error } = dataSourceError as DataSourceOperationError;

      return Result.withFailure(
        Failure.fromError(InsertError.create<Mine>(mine, type, error))
      );
    }

    return Result.withContent(mine);
  }

  /**
   * Send multimple documents collectively. In case of failure of sending any
   * of the documents, the operation is not interrupted. The method returns
   * an array of the inserted mines entities.
   *
   * @async
   * @param {Mine[]} mines
   * @returns {Promise<Result<Mine[]>}
   */
  public async insertMany(
    mines: Mine[]
  ): Promise<Result<Mine[], InsertManyError<Mine>>> {
    try {
      const dtos = mines.map(mine => mine.toDto());
      // Documents may be reordered by mongodb to increase performance.
      // Applications should not depend on ordering of inserts. Therefore,
      // we will not use the result of this operation for any purpose.
      await this.minesMongoSource.insertMany(dtos);

      return Result.withContent(mines);
    } catch (error) {
      // return a failure with an error containing lists
      // of items that were not inserted into the data source.
      const { writeErrors, concernError } = error as DataSourceBulkWriteError;

      return Result.withFailure(
        Failure.fromError(
          InsertManyError.create<Mine>(mines, writeErrors, concernError)
        )
      );
    }
  }
}
