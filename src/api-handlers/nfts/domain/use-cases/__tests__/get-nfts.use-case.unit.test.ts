/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { GetNftsUseCase } from '../get-nfts.use-case';
import { GetNftsInput } from '../../models/get-nfts.input';
import { NftRepository } from '@common/nfts/domain/repositories/nft.repository';

const nftRepository = {
  getNfts: jest.fn(),
} as any;

let container: Container;
let useCase: GetNftsUseCase;

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
    container.bind<GetNftsUseCase>(GetNftsUseCase.Token).to(GetNftsUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetNftsUseCase>(GetNftsUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetNftsUseCase.Token).not.toBeNull();
  });

  it('Should call nftRepository.countNfts', async () => {
    await useCase.execute(GetNftsInput.fromDto(dto));

    expect(nftRepository.getNfts).toBeCalled();
  });
});
