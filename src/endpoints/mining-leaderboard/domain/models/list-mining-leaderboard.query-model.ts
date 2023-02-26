import { MineDocument } from '@alien-worlds/alienworlds-api-common';
import {
  MongoDB,
  MongoFindQueryParams,
  QueryModel,
} from '@alien-worlds/api-core';
import { ListMiningLeaderboardInput } from './list-mining-leaderboard.input';

export class ListMiningLeaderboardQueryModel extends QueryModel {
  /**
   *
   * @param {ListMiningLeaderboardInput} input
   * @returns {ListMiningLeaderboardInput}
   */
  public static create(
    input: ListMiningLeaderboardInput
  ): ListMiningLeaderboardQueryModel {
    const { from, to, filter, sort, page, itemsPerPage } = input;

    return new ListMiningLeaderboardQueryModel(
      from,
      to,
      filter,
      sort,
      page,
      itemsPerPage
    );
  }

  /**
   *
   * @constructor
   * @private
   */
  private constructor(
    public readonly from: string,
    public readonly to: string,
    public readonly filter: string,
    public readonly sort: string,
    public readonly page: number,
    public readonly itemsPerPage: number
  ) {
    super();
  }

  public toQueryParams(): MongoFindQueryParams<MineDocument> {
    const {
      from,
      to,
      filter: filterBy,
      sort: sortBy,
      page,
      itemsPerPage,
    } = this;
    const filter = {};
    const options = {};

    /**
     * Magic
     */

    return { filter, options };
  }
}
