import { MiningLeaderboardTimeframe } from '@alien-worlds/alienworlds-api-common';
import { ListLeaderboardRequestDto } from '../../data/mining-leaderboard.dtos';

/**
 * @class
 */
export class ListMiningLeaderboardInput {
  /**
   *
   * @param {ListLeaderboardRequestDto} dto
   * @returns {ListMiningLeaderboardInput}
   */
  public static fromRequest(
    dto: ListLeaderboardRequestDto
  ): ListMiningLeaderboardInput {
    const { from, to, filter, sort, page, items_per_page } = dto;

    return new ListMiningLeaderboardInput(
      from,
      to,
      filter,
      sort,
      page,
      items_per_page
    );
  }
  /**
   *
   * @constructor
   * @private
   */
  private constructor(
    public readonly timeframe: MiningLeaderboardTimeframe,
    public readonly filter: string,
    public readonly order: string
  ) {}
}
