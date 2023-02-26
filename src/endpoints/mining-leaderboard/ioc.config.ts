import { Container } from '@alien-worlds/api-core';
import { setupMiningLeaderboardRepository } from '@alien-worlds/alienworlds-api-common';
import { MongoSource } from '@alien-worlds/api-core';
import { ListMiningLeaderboardUseCase } from './domain/use-cases/list-mining-leaderboard.use-case';
import { MiningLeaderboardController } from './domain/mining-leaderboard.controller';

export const bindMiningLeaderboardEndpointComponents = async (
  container: Container,
  mongoSource: MongoSource
): Promise<Container> => {
  await setupMiningLeaderboardRepository(mongoSource, container);
  container
    .bind<ListMiningLeaderboardUseCase>(ListMiningLeaderboardUseCase.Token)
    .to(ListMiningLeaderboardUseCase);
  container
    .bind<MiningLeaderboardController>(MiningLeaderboardController.Token)
    .to(MiningLeaderboardController);

  return container;
};
