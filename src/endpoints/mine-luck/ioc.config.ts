import { Container } from '@alien-worlds/api-core';
import {
  MineMongoSource,
  MineMapper,
} from '@alien-worlds/alienworlds-api-common';
import { MongoSource } from '@alien-worlds/api-core';
import { MineLuckController } from './domain/mine-luck.controller';
import { ListMineLuckUseCase } from './domain/use-cases/list-mine-luck.use-case';
import { MineLuckRepository } from './domain/repositories/mine-luck.repository';
import { MineLuckRepositoryImpl } from './data/repositories/mine-luck.repository-impl';

export const bindMineLuckEndpointComponents = async (
  container: Container,
  mongoSource: MongoSource
): Promise<Container> => {
  const repositoryImpl = new MineLuckRepositoryImpl(
    new MineMongoSource(mongoSource),
    new MineMapper()
  );

  container
    .bind<MineLuckRepository>(MineLuckRepository.Token)
    .toConstantValue(repositoryImpl);

  container
    .bind<ListMineLuckUseCase>(ListMineLuckUseCase.Token)
    .to(ListMineLuckUseCase);
  container
    .bind<MineLuckController>(MineLuckController.Token)
    .to(MineLuckController);

  return container;
};
