import { inject, injectable } from 'inversify';
import { Mine } from '../domain/entities/mine';
import { MinesRepository } from '../domain/mines.repository';
import { MinesMongoSource } from './data-sources/mines.mongo.source';

@injectable()
export class MinesRepositoryImpl implements MinesRepository {
  constructor(
    @inject(MinesMongoSource.Token) private minesMongoSource: MinesMongoSource
  ) {}

  public async getLastBlock(): Promise<Mine> {
    const dto = await this.minesMongoSource.findLastBlock();
    return Mine.fromDto(dto);
  }
}
