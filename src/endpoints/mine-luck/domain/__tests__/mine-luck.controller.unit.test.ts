/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from '@alien-worlds/api-core';
import { MineLuckController } from '../mine-luck.controller';
import { ListMineLuckUseCase } from '../use-cases/list-mine-luck.use-case';
import { ListMineLuckInput } from '../models/list-mine-luck.input';

const listMineLuckUseCase = {
  execute: jest.fn(() => []),
};

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
      .bind<ListMineLuckUseCase>(ListMineLuckUseCase.Token)
      .toConstantValue(listMineLuckUseCase as any);
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

  it('Should execute ListMineLuckUseCase', async () => {
    await controller.listMineLuck(ListMineLuckInput.fromDto(dto));

    expect(listMineLuckUseCase.execute).toBeCalled();
  });
});
