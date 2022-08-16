/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { MineLuckController } from '../mine-luck.controller';
import { GetMineLuckUseCase } from '../use-cases/get-mine-luck.use-case';
import { GetMineLuckInput } from '../models/get-mine-luck.input';

const getMineLuckUseCase = {
  execute: jest.fn(() => []),
} as any;

let container: Container;
let controller: MineLuckController;

const dto = {
  query: {
    from: '2021-06-17T01:05:38.000Z',
    to: '2021-06-17T02:05:38.000Z',
  },
};

describe('Asset Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<GetMineLuckUseCase>(GetMineLuckUseCase.Token)
      .toConstantValue(getMineLuckUseCase);
    container
      .bind<MineLuckController>(MineLuckController.Token)
      .to(MineLuckController);
  });

  beforeEach(() => {
    controller = container.get<MineLuckController>(MineLuckController.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(MineLuckController.Token).not.toBeNull();
  });

  it('Should execute GetMineLuckUseCase', async () => {
    await controller.getMineLuck(GetMineLuckInput.fromDto(dto));

    expect(getMineLuckUseCase.execute).toBeCalled();
  });
});
