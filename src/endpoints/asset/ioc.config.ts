import { bindAssetsRepository } from '@alien-worlds/alienworlds-api-common';
import { MongoSource } from '@alien-worlds/api-core';
import { Container } from '@alien-worlds/api-core';
import { AssetController } from './domain/asset.controller';
import { ListAssetsUseCase } from './domain/use-cases/list-assets.use-case';

export const bindAssetsEndpointComponents = async (
  container: Container,
  mongoSource: MongoSource
): Promise<Container> => {
  bindAssetsRepository(container, mongoSource);
  container
    .bind<ListAssetsUseCase>(ListAssetsUseCase.Token)
    .to(ListAssetsUseCase);
  container.bind<AssetController>(AssetController.Token).to(AssetController);

  return container;
};
