import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { DataSourceBulkWriteError } from '@core/architecture/data/errors/data-source-bulk-write.error';
import { Mine } from '../domain/entities/mine';
import { InsertManyError } from '../domain/errors/insert-many.error';
import { MineRepository } from '../domain/mine.repository';
import { MineMongoSource } from './data-sources/mine.mongo.source';

/**
 * @class
 */
export class MineRepositoryImpl implements MineRepository {
  private storage: Mine[] = [];
  /**
   * @constructor
   * @param {MineMongoSource} minesMongoSource
   */
  constructor(private minesMongoSource: MineMongoSource) {}

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
   * Store mine for later bulk upload to data source.
   *
   * @param {Mine} mine
   */
  public cache(mine: Mine): void {
    this.storage.push(mine);
  }

  /**
   * Get cached mine entities.
   *
   * @returns {Mine[]}
   */
  public getCachedMines(): Mine[] {
    return this.storage;
  }

  /**
   * Get number of cached entities
   *
   * @returns {number}
   */
  public getCacheSize(): number {
    return this.storage.length;
  }

  /**
   * Clear storage.
   */
  public clearCache(): void {
    this.storage = [];
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
    const dtos = mines.map(mine => mine.toDto());

    try {
      // Documents may be reordered by mongodb to increase performance.
      // Applications should not depend on ordering of inserts. Therefore,
      // we will not use the result of this operation for any purpose.
      await this.minesMongoSource.insertMany(dtos);
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

    return Result.withContent(mines);
  }

  /**
   * Send cached entities collectively. In case of failure of sending any
   * of the documents, the operation is not interrupted. The method returns
   * an array of the inserted mines entities.
   *
   * @async
   * @param {boolean} shouldClearCache
   * @returns {Promise<Result<Mine[]>}
   */
  public async insertCached(
    shouldClearCache?: boolean
  ): Promise<Result<Mine[], InsertManyError<Mine>>> {
    const insertResult = await this.insertMany(this.storage);

    if (shouldClearCache) {
      this.clearCache();
    }

    return insertResult;
  }
}
