/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from '@alien-worlds/api-core';
import { CountNftsUseCase } from '../count-nfts.use-case';
import { ListNftsInput } from '../../models/list-nfts.input';
import { NftRepository } from '@alien-worlds/alienworlds-api-common';

const nftRepository = {
  count: jest.fn(),
} as any;

let container: Container;
let useCase: CountNftsUseCase;

const request = {
  query: {
    limit: 10,
    from: '2021-06-17T01:05:38.000Z',
    to: '2021-06-17T01:05:38.000Z',
    global_sequence_from: 1,
    global_sequence_to: 2,
    miner: 'fake_miner',
    land_id: 'fake_land_id',
    sort: 'asc',
    rarity: 'rare',
  },
} as any;

describe('CountNftsUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<NftRepository>(NftRepository.Token)
      .toConstantValue(nftRepository);
    container
      .bind<CountNftsUseCase>(CountNftsUseCase.Token)
      .to(CountNftsUseCase);
  });

  beforeEach(() => {
    useCase = container.get<CountNftsUseCase>(CountNftsUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(CountNftsUseCase.Token).not.toBeNull();
  });

  it('Should call nftRepository.countNfts', async () => {
    await useCase.execute(ListNftsInput.fromRequest(request));

    expect(nftRepository.count).toBeCalled();
  });
});
