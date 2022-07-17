import { DataSourceBulkWriteError } from '@core/architecture/data/errors/data-source-bulk-write.error';
import { DataSourceOperationError } from '@core/architecture/data/errors/data-source-operation.error';
import {
  AggregateOptions,
  AggregationCursor,
  Collection,
  Document,
  Filter,
  FindCursor,
  FindOptions,
  MatchKeysAndValues,
  OptionalUnlessRequiredId,
  WithId,
} from 'mongodb';
import { MongoSource } from './mongo.source';

/**
 * Represents MongoDB data source.
 * @class
 */
export class CollectionMongoSource<T> {
  protected collection: Collection<T>;

  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(
    protected mongoSource: MongoSource,
    protected collectionName: string
  ) {
    this.collection = this.mongoSource.database.collection<T>(collectionName);
  }

  /**
   * Find a document that matches the filter and options
   *
   * @async
   * @param {Filter<T>} filter
   * @param {FindOptions} options
   * @returns {T}
   * @throws {DataSourceWriteError}
   */
  public async findOne(
    filter: Filter<T>,
    options?: FindOptions
  ): Promise<WithId<T>> {
    try {
      return this.collection.findOne(filter, options);
    } catch (error) {
      throw DataSourceOperationError.fromError(error);
    }
  }

  /**
   * Find documents that matches the filter and options
   *
   * @async
   * @param {Filter<T>} filter
   * @param {FindOptions} options
   * @returns {T[]}
   * @throws {DataSourceWriteError}
   */
  public async find(
    filter: Filter<T>,
    options?: FindOptions
  ): Promise<FindCursor<WithId<T>>> {
    try {
      return this.collection.find(filter, options);
    } catch (error) {
      throw DataSourceOperationError.fromError(error);
    }
  }

  /**
   * @async
   * @param {Document[]} pipeline
   * @param {AggregateOptions} options
   * @returns {T[]}
   * @throws {DataSourceWriteError}
   */
  public async aggregate(
    pipeline: T[],
    options?: AggregateOptions
  ): Promise<AggregationCursor<WithId<T>>> {
    try {
      return this.collection.aggregate(pipeline, options);
    } catch (error) {
      throw DataSourceOperationError.fromError(error);
    }
  }

  /**
   * Send updated document to the data source.
   *
   * @async
   * @param {T} dto
   * @returns {T} ID of added document
   * @throws {DataSourceWriteError}
   */
  public async update(dto: T): Promise<T> {
    const { _id, ...dtoWithoutId } = dto as T & Document;
    try {
      await this.collection.updateOne(
        { _id },
        { $set: dtoWithoutId as MatchKeysAndValues<T> }
      );
      return dto;
    } catch (error) {
      throw DataSourceOperationError.fromError(error);
    }
  }

  /**
   * Add document to the data source.
   *
   * @async
   * @param {T} dto
   * @returns {string} ID of added document
   * @throws {DataSourceWriteError}
   */
  public async insert(dto: T): Promise<string> {
    try {
      const { insertedId } = await this.collection.insertOne(
        dto as OptionalUnlessRequiredId<T>
      );
      return insertedId.toString();
    } catch (error) {
      throw DataSourceOperationError.fromError(error);
    }
  }

  /**
   * Insert multiple documents in one set.
   *
   * Documents are inserted in an unordered format and may be
   * reordered by mongod to increase performance.
   *
   * Applications should not depend on ordering of inserts.
   *
   * @async
   * @param {T[]} dtos
   * @returns {string[]} IDs of added documents
   * @throws {DataSourceBulkWriteError}
   */
  public async insertMany(dtos: T[]): Promise<string[]> {
    try {
      const inserted = await this.collection.insertMany(
        dtos as OptionalUnlessRequiredId<T>[],
        {
          ordered: false,
        }
      );
      return Object.values(inserted.insertedIds).map(objectId =>
        objectId.toString()
      );
    } catch (error) {
      throw DataSourceBulkWriteError.create(error);
    }
  }

  /**
   * Remove document from the data source.
   *
   * @async
   * @param {T} dto
   * @returns {boolean}
   * @throws {DataSourceWriteError}
   */
  public async remove(dto: T): Promise<boolean> {
    try {
      const { _id } = dto as WithId<T>;
      const filter = { _id } as unknown as Filter<T>; // TODO Ugly can we fix it?
      const { deletedCount } = await this.collection.deleteOne(filter);

      return Boolean(deletedCount);
    } catch (error) {
      throw DataSourceOperationError.fromError(error);
    }
  }

  /**
   * Find documents by data
   *
   * @param {T} data
   * @returns {AtomicTransferDocument}
   */
  public async findByData<DataType, OptionsType>(
    data: DataType,
    options?: OptionsType
  ): Promise<WithId<T>[]> {
    const cursor = Array.isArray(data)
      ? await this.aggregate(data, options)
      : await this.find(data, options);

    return cursor.toArray();
  }
}
