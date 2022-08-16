/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { GetMinesUseCase } from '../use-cases/get-mines.use-case';
import { MinesController } from '../mines.controller';
import { GetMinesInput } from '../models/get-mines.input';

const getMinesUseCase = {
  execute: jest.fn(() => []),
} as any;

let container: Container;
let controller: MinesController;

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

describe('Mines Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<GetMinesUseCase>(GetMinesUseCase.Token)
      .toConstantValue(getMinesUseCase);
    container.bind<MinesController>(MinesController.Token).to(MinesController);
  });

  beforeEach(() => {
    controller = container.get<MinesController>(MinesController.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(MinesController.Token).not.toBeNull();
  });

  it('Should execute GetMinesUseCase', async () => {
    await controller.getMines(GetMinesInput.fromRequest(dto));

    expect(getMinesUseCase.execute).toBeCalled();
  });
});
