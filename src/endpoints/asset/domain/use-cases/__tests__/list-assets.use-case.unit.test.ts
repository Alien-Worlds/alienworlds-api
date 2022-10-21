/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { ListAssetsUseCase } from '../list-assets.use-case';
import { ListAssetsInput } from '../../models/list-assets.input';
import { AssetRepository } from '@alien-worlds/alienworlds-api-common';
import { Failure, Result } from '@alien-worlds/api-core';

const assetRepository = {
  find: jest.fn(),
};

let container: Container;
let useCase: ListAssetsUseCase;

describe('Asset Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<AssetRepository>(AssetRepository.Token)
      .toConstantValue(assetRepository as any);
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

  it('Should call assetRepository.find when asset ids were given', async () => {
    await useCase.execute(ListAssetsInput.fromRequest({ id: '1,2' }));

    expect(assetRepository.find).toBeCalled();
  });

  it('Should call assetRepository.find when owner was given', async () => {
    await useCase.execute(ListAssetsInput.fromRequest({ owner: 'foo' }));

    expect(assetRepository.find).toBeCalled();
  });

  it('Should return a failure with asset not found error when neither id nor owner is specified', async () => {
    assetRepository.find.mockResolvedValue(
      Result.withFailure(Failure.fromError(new Error('')))
    );
    const result = await useCase.execute(ListAssetsInput.fromRequest({}));

    expect(result.isFailure).toBeTruthy();
  });
});
