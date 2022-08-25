/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { ListAssetsUseCase } from '../list-assets.use-case';
import { AssetRepository } from '@common/assets/domain/repositories/asset.repository';
import { ListAssetsInput } from '../../models/list-assets.input';

const assetRepository = {
  getManyByAssetId: jest.fn(() => {}),
  listAssets: jest.fn(() => {}),
} as any;

let container: Container;
let useCase: ListAssetsUseCase;

describe('Asset Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<AssetRepository>(AssetRepository.Token)
      .toConstantValue(assetRepository);
    container
      .bind<ListAssetsUseCase>(ListAssetsUseCase.Token)
      .to(ListAssetsUseCase);
  });

  beforeEach(() => {
    useCase = container.get<ListAssetsUseCase>(ListAssetsUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(ListAssetsUseCase.Token).not.toBeNull();
  });

  it('Should call assetRepository.getManyByAssetId when asset ids were given', async () => {
    await useCase.execute(ListAssetsInput.fromRequest({ id: '1,2' }));

    expect(assetRepository.getManyByAssetId).toBeCalled();
  });

  it('Should call assetRepository.listAssets when owner was given', async () => {
    await useCase.execute(ListAssetsInput.fromRequest({ owner: 'foo' }));

    expect(assetRepository.listAssets).toBeCalled();
  });

  it('Should return a failure with asset not found error when neither id nor owner is specified', async () => {
    const result = await useCase.execute(ListAssetsInput.fromRequest({}));

    expect(result.isFailure).toBeTruthy();
  });
});
