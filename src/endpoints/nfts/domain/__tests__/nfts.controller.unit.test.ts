/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { NftsController } from '../nfts.controller';
import { ListNftsUseCase } from '../use-cases/list-nfts.use-case';
import { CountNftsUseCase } from '../use-cases/count-nfts.use-case';
import { ListNftsInput } from '../models/list-nfts.input';
import { Failure, Result } from '@alien-worlds/api-core';

const listNftsUseCase = {
  execute: jest.fn(),
};

const countNftsUseCase = {
  execute: jest.fn(),
};

let container: Container;
let controller: NftsController;

const dto = {
  limit: 10,
  from: '2021-06-17T01:05:38.000Z',
  to: '2021-06-17T01:05:38.000Z',
  global_sequence_from: 1,
  global_sequence_to: 2,
  miner: 'fake_miner',
  land_id: 'fake_land_id',
  sort: 'asc',
  rarity: 'rare',
};

describe('Nfts Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<ListNftsUseCase>(ListNftsUseCase.Token)
      .toConstantValue(listNftsUseCase as any);
    container
      .bind<CountNftsUseCase>(CountNftsUseCase.Token)
      .toConstantValue(countNftsUseCase as any);
    container.bind<NftsController>(NftsController.Token).to(NftsController);
  });

  beforeEach(() => {
    controller = container.get<NftsController>(NftsController.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(NftsController.Token).not.toBeNull();
  });

  it('Should execute listNftsUseCase and countNftsUseCase', async () => {
    listNftsUseCase.execute.mockResolvedValue(Result.withContent([]));
    countNftsUseCase.execute.mockResolvedValue(Result.withContent(1));
    await controller.listNfts(ListNftsInput.fromDto(dto));

    expect(listNftsUseCase.execute).toBeCalled();
    expect(countNftsUseCase.execute).toBeCalled();
  });

  it('Should return a failure when listNftsUseCase fails', async () => {
    listNftsUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );
    const result = await controller.listNfts(ListNftsInput.fromDto(dto));

    expect(result.isFailure).toBeTruthy();
  });

  it('Should return a failure when countNftsUseCase fails', async () => {
    listNftsUseCase.execute.mockResolvedValue(Result.withContent([]));
    countNftsUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );
    const result = await controller.listNfts(ListNftsInput.fromDto(dto));

    expect(result.isFailure).toBeTruthy();
  });
});
