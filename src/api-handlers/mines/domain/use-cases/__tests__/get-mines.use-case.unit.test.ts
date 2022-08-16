/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { GetMinesUseCase } from '../get-mines.use-case';
import { GetMinesInput } from '../../models/get-mines.input';
import { MineRepository } from '@common/mines/domain/mine.repository';

const mineRepository = {
  getMines: jest.fn(() => []),
} as any;

let container: Container;
let useCase: GetMinesUseCase;

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

describe('GetMinesUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<MineRepository>(MineRepository.Token)
      .toConstantValue(mineRepository);
    container.bind<GetMinesUseCase>(GetMinesUseCase.Token).to(GetMinesUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetMinesUseCase>(GetMinesUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    useCase = null;
  });

  it('"Token" should be set', () => {
    expect(GetMinesUseCase.Token).not.toBeNull();
  });

  it('Should execute GetMinesUseCase', async () => {
    await useCase.execute(GetMinesInput.fromRequest(dto));

    expect(mineRepository.getMines).toBeCalled();
  });
});
