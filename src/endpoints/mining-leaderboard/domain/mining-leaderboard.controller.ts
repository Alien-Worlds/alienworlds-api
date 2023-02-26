import { MiningLeaderboard } from '@alien-worlds/alienworlds-api-common';
import { inject, injectable } from '@alien-worlds/api-core';
import { Result } from '@alien-worlds/api-core';
import { ListMiningLeaderboardInput } from './models/list-mining-leaderboard.input';
import { ListMiningLeaderboardUseCase } from './use-cases/list-mining-leaderboard.use-case';

/**
 * @class
 */
@injectable()
export class MiningLeaderboardController {
  public static Token = 'MINING_LEADERBOARD_CONTROLLER';

  constructor(
    @inject(ListMiningLeaderboardUseCase.Token)
    private listMinesUseCase: ListMiningLeaderboardUseCase
  ) {}

  /**
   * @async
   * @param {ListMiningLeaderboardInput} input
   * @returns {Promise<Result<Mine[]>>}
   */
  public async list(
    input: ListMiningLeaderboardInput
  ): Promise<Result<MiningLeaderboard[]>> {
    return this.listMinesUseCase.execute(input);
  }
}
