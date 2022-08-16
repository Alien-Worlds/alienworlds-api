/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { GetMineLuckUseCase } from '../get-mine-luck.use-case';
import { GetMineLuckInput } from '../../models/get-mine-luck.input';
import { MineLuckRepository } from '../../mine-luck.repository';

const mineLuckRepository = {
  getMineLuck: jest.fn(() => []),
} as any;

let container: Container;
let useCase: GetMineLuckUseCase;

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
      .bind<MineLuckRepository>(MineLuckRepository.Token)
      .toConstantValue(mineLuckRepository);
    container
      .bind<GetMineLuckUseCase>(GetMineLuckUseCase.Token)
      .to(GetMineLuckUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetMineLuckUseCase>(GetMineLuckUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetMineLuckUseCase.Token).not.toBeNull();
  });

  it('Should call mineLuckRepository.getMineLuck', async () => {
    await useCase.execute(GetMineLuckInput.fromDto(dto));

    expect(mineLuckRepository.getMineLuck).toBeCalled();
  });
});
