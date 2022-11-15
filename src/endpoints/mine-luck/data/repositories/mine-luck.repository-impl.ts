import { Mine, MineDocument } from '@alien-worlds/alienworlds-api-common';
import { Failure, RepositoryImpl, Result } from '@alien-worlds/api-core';
import { MineLuck } from '../../domain/entities/mine-luck';
import { UndefinedMineLuckError } from '../../domain/errors/undefined-mine-luck.error';
import { ListMineLuckQueryModel } from '../../domain/models/list-mine-luck.query-model';
import { MineLuckDto } from '../mine-luck.dtos';

export class MineLuckRepositoryImpl extends RepositoryImpl<Mine, MineDocument> {
  /**
   *
   * @param {string} from
   * @param {string} to
   * @returns {Promise<Result<MineLuck[]>>}
   */
  public async listMineLuck(
    from: string,
    to: string
  ): Promise<Result<MineLuck[]>> {
    try {
      const { pipeline, options } = ListMineLuckQueryModel.create(
        from,
        to
      ).toQueryParams();

      const dtos = await this.source.aggregate<MineLuckDto>({
        pipeline,
        options,
      });

      return Result.withContent(dtos.map(MineLuck.fromDto));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
