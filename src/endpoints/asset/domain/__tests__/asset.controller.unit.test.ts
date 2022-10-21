/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from '@alien-worlds/api-core';
import { AssetController } from '../asset.controller';
import { ListAssetsUseCase } from '../use-cases/list-assets.use-case';
import { ListAssetsInput } from '../models/list-assets.input';

const listAssetsUseCase = {
  execute: jest.fn(() => {}),
} as any;

let container: Container;
let controller: AssetController;

describe('Asset Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<ListAssetsUseCase>(ListAssetsUseCase.Token)
      .toConstantValue(listAssetsUseCase);
    container.bind<AssetController>(AssetController.Token).to(AssetController);
  });

  beforeEach(() => {
    controller = container.get<AssetController>(AssetController.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(AssetController.Token).not.toBeNull();
  });

  it('Should call ListAssetsUseCase execute', async () => {
    await controller.listAssets(ListAssetsInput.fromRequest({}));

    expect(listAssetsUseCase.execute).toBeCalled();
  });
});
