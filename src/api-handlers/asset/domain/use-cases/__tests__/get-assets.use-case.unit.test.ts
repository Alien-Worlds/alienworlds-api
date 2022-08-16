/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { GetAssetsUseCase } from '../get-assets.use-case';
import { AssetRepository } from '@common/assets/domain/repositories/asset.repository';
import { GetAssetsInput } from '../../models/get-assets.input';

const assetRepository = {
  getManyByAssetId: jest.fn(() => {}),
  getAssets: jest.fn(() => {}),
} as any;

let container: Container;
let useCase: GetAssetsUseCase;

describe('Asset Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<AssetRepository>(AssetRepository.Token)
      .toConstantValue(assetRepository);
    container
      .bind<GetAssetsUseCase>(GetAssetsUseCase.Token)
      .to(GetAssetsUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetAssetsUseCase>(GetAssetsUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetAssetsUseCase.Token).not.toBeNull();
  });

  it('Should call assetRepository.getManyByAssetId when asset ids were given', async () => {
    await useCase.execute(GetAssetsInput.fromRequest({ id: '1,2' }));

    expect(assetRepository.getManyByAssetId).toBeCalled();
  });

  it('Should call assetRepository.getAssets when owner was given', async () => {
    await useCase.execute(GetAssetsInput.fromRequest({ owner: 'foo' }));

    expect(assetRepository.getAssets).toBeCalled();
  });

  it('Should return a failure with asset not found error when neither id nor owner is specified', async () => {
    const result = await useCase.execute(GetAssetsInput.fromRequest({}));

    expect(result.isFailure).toBeTruthy();
  });
});
