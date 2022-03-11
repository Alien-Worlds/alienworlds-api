import { Collection } from 'mongodb';
import { MongoSource } from '@core/data/data-sources/mongo.source';
import { inject, injectable } from 'inversify';
import { MineDocument } from '../mines.dtos';

/**
 * Mines data source from the mongo database
 * @class
 */
@injectable()
export class MinesMongoSource {
  public static Token = 'MINES_MONGO_SOURCE';
  private collection: Collection;

  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(@inject(MongoSource.Token) private mongoSource: MongoSource) {
    this.collection = this.mongoSource.database.collection('mines');
  }

  /**
   * Gets the last block indexed from the database.
   *
   * @async
   * @returns {Promise<MineDocument>}
   */
  public async findLastBlock(): Promise<MineDocument> {
    const result = await this.collection.findOne(
      {},
      { limit: 1, sort: { block_num: -1 } }
    );
    return <MineDocument>result;
  }
}
