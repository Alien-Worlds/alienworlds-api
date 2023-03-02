import { Container } from '@alien-worlds/api-core';
import {
  MiningDailyLeaderboardRepository,
  MiningLeaderboardTimeframe,
  MiningWeeklyLeaderboardRepository,
  setupMiningLeaderboardRepository,
} from '@alien-worlds/alienworlds-api-common';
import { MongoSource } from '@alien-worlds/api-core';
import { ListMiningLeaderboardUseCase } from './domain/use-cases/list-mining-leaderboard.use-case';
import { MiningLeaderboardController } from './domain/mining-leaderboard.controller';
import { CountMiningLeaderboardUseCase } from './domain/use-cases/count-mining-leaderboard.use-case';

export const bindMiningLeaderboardEndpointComponents = async (
  container: Container,
  mongoSource: MongoSource
): Promise<Container> => {
  await setupMiningLeaderboardRepository(
    MiningDailyLeaderboardRepository.Token,
    MiningLeaderboardTimeframe.Daily,
    mongoSource,
    container
  );
  await setupMiningLeaderboardRepository(
    MiningWeeklyLeaderboardRepository.Token,
    MiningLeaderboardTimeframe.Weekly,
    mongoSource,
    container
  );
  //
  container
    .bind<ListMiningLeaderboardUseCase>(ListMiningLeaderboardUseCase.Token)
    .to(ListMiningLeaderboardUseCase);
  container
    .bind<CountMiningLeaderboardUseCase>(CountMiningLeaderboardUseCase.Token)
    .to(CountMiningLeaderboardUseCase);
  container
    .bind<MiningLeaderboardController>(MiningLeaderboardController.Token)
    .to(MiningLeaderboardController);

  return container;
};
