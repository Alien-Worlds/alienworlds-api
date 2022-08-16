/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { AssetController } from '../asset.controller';
import { GetAssetsUseCase } from '../use-cases/get-assets.use-case';
import { GetAssetsInput } from '../models/get-assets.input';

const getAssetsUseCase = {
  execute: jest.fn(() => {}),
} as any;

let container: Container;
let controller: AssetController;

describe('Asset Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<GetAssetsUseCase>(GetAssetsUseCase.Token)
      .toConstantValue(getAssetsUseCase);
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

  it('Should call GetAssetsUseCase execute', async () => {
    await controller.getAssets(GetAssetsInput.fromRequest({}));

    expect(getAssetsUseCase.execute).toBeCalled();
  });
});
