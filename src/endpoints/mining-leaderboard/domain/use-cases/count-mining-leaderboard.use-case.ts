import {
  MiningDailyLeaderboardRepository,
  MiningLeaderboardTimeframe,
  MiningMonthlyLeaderboardRepository,
  MiningWeeklyLeaderboardRepository,
} from '@alien-worlds/alienworlds-api-common';
import { Result, UseCase, inject, injectable } from '@alien-worlds/api-core';

/**
 * @class
 */
@injectable()
export class CountMiningLeaderboardUseCase implements UseCase<number> {
  public static Token = 'COUNT_MINING_LEADERBOARD_USE_CASE';

  constructor(
    @inject(MiningDailyLeaderboardRepository.Token)
    private dailyLeaderboard: MiningDailyLeaderboardRepository,
    @inject(MiningWeeklyLeaderboardRepository.Token)
    private weeklyLeaderboard: MiningWeeklyLeaderboardRepository,
    @inject(MiningMonthlyLeaderboardRepository.Token)
    private monthlyLeaderboard: MiningMonthlyLeaderboardRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<number>>}
   */
  public async execute(
    timeframe: MiningLeaderboardTimeframe
  ): Promise<Result<number>> {
    switch (timeframe) {
      case MiningLeaderboardTimeframe.Daily: {
        return this.dailyLeaderboard.count({});
      }
      //.....
    }
  }
}
