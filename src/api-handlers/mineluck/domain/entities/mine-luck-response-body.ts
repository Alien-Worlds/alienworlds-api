import { MineLuckResultDto } from 'api-handlers/mineluck/data/mine-luck.dtos';
import { MineLuck } from './mine-luck';

/**
 * @class
 */
export class MineLuckResponseBody {
  /**
   *
   * @param {AssetRequestQueryOptionsDto} dto
   * @returns {MineLuckResponseBody}
   */
  public static fromEntities(entities: MineLuck[]): MineLuckResponseBody {
    return new MineLuckResponseBody(
      entities.map(entity => entity.toJson()),
      entities.length
    );
  }

  /**
   *
   * @constructor
   * @private
   * @param {MineLuckResultDto[]} results
   */
  private constructor(
    public readonly results: MineLuckResultDto[],
    public readonly count: number
  ) {}

  public toJson() {
    const { count, results } = this;
    return {
      results,
      count,
    };
  }
}
