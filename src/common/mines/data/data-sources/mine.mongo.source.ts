import { MineDocument } from '../mines.dtos';
import { CollectionMongoSource } from '@core/storage/data/data-sources/collection.mongo.source';
import { MongoSource } from '@core/storage/data/data-sources/mongo.source';

/**
 * Mines data source from the mongo database
 * @class
 */
export class MineMongoSource extends CollectionMongoSource<MineDocument> {
  public static Token = 'MINE_MONGO_SOURCE';

  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(mongoSource: MongoSource) {
    super(mongoSource, 'mines');
  }

  /**
   * Gets the last block indexed from the database.
   *
   * @async
   * @returns {Promise<MineDocument>}
   */
  public async findLastBlock(): Promise<MineDocument> {
    return <MineDocument>(
      this.findOne({}, { limit: 1, sort: { block_num: -1 } })
    );
  }
}
