import { MineLuckRequestOptionsDto } from '../../data/mine-luck.dtos';

/**
 * @class
 */
export class GetMineLuckOptions {
  /**
   *
   * @param {MineLuckRequestOptionsDto} dto
   * @returns {GetMineLuckOptions}
   */
  public static fromDto(dto: MineLuckRequestOptionsDto): GetMineLuckOptions {
    const { query } = dto;
    return new GetMineLuckOptions(query?.from, query?.to);
  }
  /**
   *
   * @constructor
   * @private
   * @param {string} from
   * @param {string} to
   */
  private constructor(
    public readonly from: string,
    public readonly to: string
  ) {}
}
