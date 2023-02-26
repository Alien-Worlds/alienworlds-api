import {
  MiningLeaderboard,
  MiningLeaderboardRepository,
} from '@alien-worlds/alienworlds-api-common';
import { Result, UseCase, inject, injectable } from '@alien-worlds/api-core';
import { ListMiningLeaderboardInput } from '../models/list-mining-leaderboard.input';
import { ListMiningLeaderboardQueryModel } from '../models/list-mining-leaderboard.query-model';

/**
 * @class
 */
@injectable()
export class ListMiningLeaderboardUseCase
  implements UseCase<MiningLeaderboard[]>
{
  public static Token = 'LIST_MINING_LEADERBOARD_USE_CASE';

  constructor(
    @inject(MiningLeaderboardRepository.Token)
    private leaderboardRepository: MiningLeaderboardRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<Asset[]>>}
   */
  public async execute(
    input: ListMiningLeaderboardInput
  ): Promise<Result<MiningLeaderboard[]>> {
    return this.leaderboardRepository.find(
      ListMiningLeaderboardQueryModel.create(input)
    );
  }
}
