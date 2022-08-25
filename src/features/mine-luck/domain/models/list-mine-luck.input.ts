import { ListMineLuckRequestDto } from '../../data/mine-luck.dtos';

/**
 * @class
 */
export class ListMineLuckInput {
  /**
   *
   * @param {ListMineLuckRequestDto} dto
   * @returns {ListMineLuckInput}
   */
  public static fromDto(dto: ListMineLuckRequestDto): ListMineLuckInput {
    const { query } = dto;
    return new ListMineLuckInput(query?.from, query?.to);
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
