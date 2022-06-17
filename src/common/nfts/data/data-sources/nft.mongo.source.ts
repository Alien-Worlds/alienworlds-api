import { MongoSource } from '@core/storage/data-sources/mongo.source';
import { DataSourceOperationError } from '@core/architecture/data/errors/data-source-operation.error';
import { NftDocument } from '../nfts.dtos';
import { CollectionMongoSource } from '@core/storage/data-sources/collection.mongo.source';

/**
 * NFTs data source from the mongo database
 * @class
 */
export class NftMongoSource extends CollectionMongoSource<NftDocument> {
  public static Token = 'NFT_MONGO_SOURCE';

  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(mongoSource: MongoSource) {
    super(mongoSource, 'nfts');
  }

  /**
   * Insert multiple documents in one set.
   *
   * @async
   * @returns {string[]} IDs of added documents
   * @throws {DataSourceWriteError}
   */
  public async insertOne(dto: NftDocument): Promise<string> {
    try {
      const { insertedId } = await this.collection.insertOne(dto);
      return insertedId.toString();
    } catch (error) {
      throw DataSourceOperationError.fromError(error);
    }
  }
}
