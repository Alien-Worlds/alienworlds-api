import { ListMineLuckRequestQuery } from '../../data/mine-luck.dtos';
import { Request } from '@alien-worlds/api-core';

/**
 * @class
 */
export class ListMineLuckInput {
  /**
   *
   * @param {ListMineLuckRequestQuery} dto
   * @returns {ListMineLuckInput}
   */
  public static fromRequest(
    request: Request<unknown, unknown, ListMineLuckRequestQuery>
  ): ListMineLuckInput {
    const { query } = request;
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
