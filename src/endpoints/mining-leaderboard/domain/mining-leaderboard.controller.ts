import { MiningLeaderboard } from '@alien-worlds/alienworlds-api-common';
import { inject, injectable } from '@alien-worlds/api-core';
import { Result } from '@alien-worlds/api-core';
import { ListMiningLeaderboardInput } from './models/list-mining-leaderboard.input';
import { CountMiningLeaderboardUseCase } from './use-cases/count-mining-leaderboard.use-case';
import { ListMiningLeaderboardUseCase } from './use-cases/list-mining-leaderboard.use-case';

/**
 * @class
 */
@injectable()
export class MiningLeaderboardController {
  public static Token = 'MINING_LEADERBOARD_CONTROLLER';

  constructor(
    @inject(ListMiningLeaderboardUseCase.Token)
    private listMinesUseCase: ListMiningLeaderboardUseCase,
    @inject(CountMiningLeaderboardUseCase.Token)
    private countMinesUseCase: CountMiningLeaderboardUseCase
  ) {}

  public async list(
    input: ListMiningLeaderboardInput
  ): Promise<Result<{ results: MiningLeaderboard[]; count: number }>> {
    const list = await this.listMinesUseCase.execute(input);
    const count = await this.countMinesUseCase.execute(input.timeframe);

    if (list.isFailure || count.isFailure) {
      //....
    }

    return Result.withContent({
      results: list.content,
      count: count.content,
    });
  }
}
