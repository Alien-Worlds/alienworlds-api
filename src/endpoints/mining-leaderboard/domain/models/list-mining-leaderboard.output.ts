import { MiningLeaderboard } from '@alien-worlds/alienworlds-api-common';
import { MiningLeaderboardResultDto } from '../../data/mining-leaderboard.dtos';

/**
 * @class
 */
export class ListMiningLeaderboardOutput {
  /**
   *
   * @returns {ListMiningLeaderboardOutput}
   */
  public static fromEntities(
    entities: MiningLeaderboard[]
  ): ListMiningLeaderboardOutput {
    return new ListMiningLeaderboardOutput(
      entities.map(entity => this.toJson(entity))
    );
  }

  /**
   *
   * @returns {ListMiningLeaderboardOutput}
   */
  public static createEmpty(): ListMiningLeaderboardOutput {
    return new ListMiningLeaderboardOutput([]);
  }

  private static toJson(entry: MiningLeaderboard): MiningLeaderboardResultDto {
    const {
      username,
      walletId,
      tlmGainsTotal,
      tlmGainsHighest,
      totalNftPoints,
      avgChargeTime,
      avgMiningPower,
      avgNftPower,
      landsMinedOn,
      planetsMinedOn,
      mineRating,
    } = entry;

    return {
      username: miner,
      tlm_gains_total: tlmGainsTotal,
      tlm_gains_highest: tlmGainsHighest,
      total_nft_points: dailyTotalNftPoints,
      avg_charge_time: avgChargeTime,
      avg_mining_power: avgMiningPower,
      avg_nft_power: avgNftPower,
      lands_mined_on: landsMinedOn,
      planets_mined_on: planetsMinedOn,
      mine_rating: mineRating,
    } as MiningLeaderboardResultDto;
  }

  /**
   *
   * @constructor
   * @private
   * @param {MiningLeaderboardResultDto[]} results
   */
  private constructor(public readonly results: MiningLeaderboardResultDto[]) {}

  public toJson() {
    const { results } = this;
    return {
      results,
    };
  }
}
