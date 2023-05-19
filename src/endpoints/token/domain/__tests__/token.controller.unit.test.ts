/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from '@alien-worlds/api-core';
import { TokenController } from '../token.controller';
import { GetCirculatingSupplyUseCase } from '../use-cases/get-circulating-supply.use-case';
import { GetTokenSuppliesUseCase } from '../use-cases/get-token-supplies.use-case';
import { GetTokenInput } from '../models/get-token.input';

const getTokenSuppliesUseCase = {
  execute: jest.fn(),
};

const getCirculatingSupplyUseCase = {
  execute: jest.fn(),
};

let container: Container;
let controller: TokenController;

const request = {
  query: {
    type: 'supply',
    offset: 0,
    id: 'foo_id',
    owner: 'foo_owner',
    schema: 'foo_schema',
  },
} as any;

describe('Token Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<GetCirculatingSupplyUseCase>(GetCirculatingSupplyUseCase.Token)
      .toConstantValue(getCirculatingSupplyUseCase as any);
    container
      .bind<GetTokenSuppliesUseCase>(GetTokenSuppliesUseCase.Token)
      .toConstantValue(getTokenSuppliesUseCase as any);
    container.bind<TokenController>(TokenController.Token).to(TokenController);
  });

  beforeEach(() => {
    controller = container.get<TokenController>(TokenController.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(TokenController.Token).not.toBeNull();
  });

  it('Should execute GetTokenSuppliesUseCase when given type is "supply"', async () => {
    await controller.getToken(GetTokenInput.fromRequest(request));

    expect(getTokenSuppliesUseCase.execute).toBeCalled();
  });

  it('Should execute GetCirculatingSupplyUseCase when given type is "circulating"', async () => {
    request.query.type = 'circulating';
    await controller.getToken(GetTokenInput.fromRequest(request));

    expect(getCirculatingSupplyUseCase.execute).toBeCalled();
  });

  it('Should return a failure when given type is invalid', async () => {
    request.query.type = 'fake';
    const output = await controller.getToken(
      GetTokenInput.fromRequest(request)
    );

    expect(output.result.isFailure).toBeTruthy();
  });
});
