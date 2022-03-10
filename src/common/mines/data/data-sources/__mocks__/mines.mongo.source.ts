import { injectable } from 'inversify';
import { MineDocument } from '../../mines.dtos';

@injectable()
export class MinesMongoSource {
  public static Token = 'MINES_MONGO_SOURCE';

  public async findLastBlock(): Promise<MineDocument> {
    return null;
  }
}
