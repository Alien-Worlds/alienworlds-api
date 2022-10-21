import { Container } from 'inversify';
import { bindNftsRepository } from '@alien-worlds/alienworlds-api-common';
import { MongoSource } from '@alien-worlds/api-core';
import { ListNftsUseCase } from './domain/use-cases/list-nfts.use-case';
import { NftsController } from './domain/nfts.controller';
import { CountNftsUseCase } from './domain/use-cases/count-nfts.use-case';

export const bindNftsEndpointComponents = async (
  container: Container,
  mongoSource: MongoSource
): Promise<Container> => {
  bindNftsRepository(container, mongoSource);
  container.bind<ListNftsUseCase>(ListNftsUseCase.Token).to(ListNftsUseCase);
  container.bind<CountNftsUseCase>(CountNftsUseCase.Token).to(CountNftsUseCase);
  container.bind<NftsController>(NftsController.Token).to(NftsController);

  return container;
};
