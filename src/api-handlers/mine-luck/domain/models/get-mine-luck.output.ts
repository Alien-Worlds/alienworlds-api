import { MineLuckResultDto } from '../../data/mine-luck.dtos';
import { MineLuck } from '../entities/mine-luck';

/**
 * @class
 */
export class GetMineLuckOutput {
  /**
   *
   * @param {AssetRequestQueryOptionsDto} dto
   * @returns {GetMineLuckOutput}
   */
  public static fromEntities(entities: MineLuck[]): GetMineLuckOutput {
    return new GetMineLuckOutput(
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
