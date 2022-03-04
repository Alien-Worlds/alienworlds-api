import { Collection } from 'mongodb';
import { MongoSource } from '@core/data/mongo.source';
import { inject, injectable } from 'inversify';
import { MineDocument } from '../mines.dtos';

@injectable()
export class MinesMongoSource {
  public static Token;
  private collection: Collection;

  constructor(@inject(MongoSource.Token) private mongoSource: MongoSource) {
    this.collection = this.mongoSource.database.collection('mines');
  }

  public async findLastBlock(): Promise<MineDocument> {
    const result = await this.collection.findOne(
      {},
      { limit: 1, sort: { block_num: -1 } }
    );
    return <MineDocument>result;
  }
}
