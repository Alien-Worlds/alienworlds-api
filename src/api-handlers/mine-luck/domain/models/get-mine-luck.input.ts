import { MineLuckRequestDto } from '../../data/mine-luck.dtos';

/**
 * @class
 */
export class GetMineLuckInput {
  /**
   *
   * @param {MineLuckRequestDto} dto
   * @returns {GetMineLuckInput}
   */
  public static fromDto(dto: MineLuckRequestDto): GetMineLuckInput {
    const { query } = dto;
    return new GetMineLuckInput(query?.from, query?.to);
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
