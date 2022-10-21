import { ListMineLuckResultDto } from '../../data/mine-luck.dtos';
import { MineLuck } from '../entities/mine-luck';

/**
 * @class
 */
export class ListMineLuckOutput {
  /**
   *
   * @param {MineLuck[]} entities
   * @returns {ListMineLuckOutput}
   */
  public static fromEntities(entities: MineLuck[]): ListMineLuckOutput {
    return new ListMineLuckOutput(
      entities.map(entity => entity.toJson()),
      entities.length
    );
  }

  /**
   *
   * @constructor
   * @private
   * @param {ListMineLuckResultDto[]} results
   */
  private constructor(
    public readonly results: ListMineLuckResultDto[],
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
