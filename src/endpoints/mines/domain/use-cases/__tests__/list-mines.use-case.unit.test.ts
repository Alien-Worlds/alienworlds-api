/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from '@alien-worlds/api-core';
import { ListMinesUseCase } from '../list-mines.use-case';
import { ListMinesInput } from '../../models/list-mines.input';
import { MineRepository } from '@alien-worlds/alienworlds-api-common';

const mineRepository = {
  find: jest.fn(() => []),
} as any;

let container: Container;
let useCase: ListMinesUseCase;

const dto = {
  limit: 10,
  from: '2021-06-17T01:05:38.000Z',
  to: '2021-06-17T02:05:38.000Z',
  global_sequence_from: 1,
  global_sequence_to: 10,
  miner: 'fake_miner',
  landowner: 'fake_landowner',
  land_id: 'fake_land_id',
  planet_name: 'fake_planet_name',
  tx_id: 'fake_transaction_id',
  sort: 'asc',
};

describe('ListMinesUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<MineRepository>(MineRepository.Token)
      .toConstantValue(mineRepository);
    container
      .bind<ListMinesUseCase>(ListMinesUseCase.Token)
      .to(ListMinesUseCase);
  });

  beforeEach(() => {
    useCase = container.get<ListMinesUseCase>(ListMinesUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    useCase = null;
  });

  it('"Token" should be set', () => {
    expect(ListMinesUseCase.Token).not.toBeNull();
  });

  it('Should call repository.find', async () => {
    await useCase.execute(ListMinesInput.fromRequest(dto));

    expect(mineRepository.find).toBeCalled();
  });
});
