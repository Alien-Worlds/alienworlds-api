/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from '@alien-worlds/api-core';
import { ListMineLuckUseCase } from '../list-mine-luck.use-case';
import { ListMineLuckInput } from '../../models/list-mine-luck.input';
import { MineLuckRepository } from '../../repositories/mine-luck.repository';

const mineLuckRepository = {
  listMineLuck: jest.fn(() => []),
} as any;

let container: Container;
let useCase: ListMineLuckUseCase;

const request = {
  query: {
    from: '2021-06-17T01:05:38.000Z',
    to: '2021-06-17T02:05:38.000Z',
  },
};

describe('ListMineluckUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<MineLuckRepository>(MineLuckRepository.Token)
      .toConstantValue(mineLuckRepository);
    container
      .bind<ListMineLuckUseCase>(ListMineLuckUseCase.Token)
      .to(ListMineLuckUseCase);
  });

  beforeEach(() => {
    useCase = container.get<ListMineLuckUseCase>(ListMineLuckUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(ListMineLuckUseCase.Token).not.toBeNull();
  });

  it('Should call mineLuckRepository.listMineLuck', async () => {
    await useCase.execute(ListMineLuckInput.fromRequest(request as any));

    expect(mineLuckRepository.listMineLuck).toBeCalled();
  });
});
