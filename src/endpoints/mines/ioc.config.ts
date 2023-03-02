import { Container } from '@alien-worlds/api-core';
import { setupMinesRepository } from '@alien-worlds/alienworlds-api-common';
import { MongoSource } from '@alien-worlds/api-core';
import { ListMinesUseCase } from './domain/use-cases/list-mines.use-case';
import { MinesController } from './domain/mines.controller';

export const bindMinesEndpointComponents = async (
  container: Container,
  mongoSource: MongoSource
): Promise<Container> => {
  await setupMinesRepository(mongoSource, container);
  container.bind<ListMinesUseCase>(ListMinesUseCase.Token).to(ListMinesUseCase);
  container.bind<MinesController>(MinesController.Token).to(MinesController);

  return container;
};