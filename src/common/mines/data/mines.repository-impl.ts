import { Failure } from '@core/domain/failure';
import { Result } from '@core/domain/result';
import { inject, injectable } from 'inversify';
import { Mine } from '../domain/entities/mine';
import { MinesRepository } from '../domain/mines.repository';
import { MinesMongoSource } from './data-sources/mines.mongo.source';

@injectable()
export class MinesRepositoryImpl implements MinesRepository {
  constructor(
    @inject(MinesMongoSource.Token) private minesMongoSource: MinesMongoSource
  ) {}

  public async getLastBlock(): Promise<Result<Mine>> {
    try {
      const dto = await this.minesMongoSource.findLastBlock();
      return Result.withContent(Mine.fromDto(dto));
    } catch (error) {
      Result.withFailure(Failure.fromError(error));
    }
  }
}
