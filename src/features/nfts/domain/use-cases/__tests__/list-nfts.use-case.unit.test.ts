/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { ListNftsUseCase } from '../list-nfts.use-case';
import { ListNftsInput } from '../../models/list-nfts.input';
import { NftRepository } from '@common/nfts/domain/repositories/nft.repository';

const nftRepository = {
  listNfts: jest.fn(),
} as any;

let container: Container;
let useCase: ListNftsUseCase;

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

describe('Asset Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<NftRepository>(NftRepository.Token)
      .toConstantValue(nftRepository);
    container.bind<ListNftsUseCase>(ListNftsUseCase.Token).to(ListNftsUseCase);
  });

  beforeEach(() => {
    useCase = container.get<ListNftsUseCase>(ListNftsUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(ListNftsUseCase.Token).not.toBeNull();
  });

  it('Should call nftRepository.countNfts', async () => {
    await useCase.execute(ListNftsInput.fromDto(dto));

    expect(nftRepository.listNfts).toBeCalled();
  });
});
