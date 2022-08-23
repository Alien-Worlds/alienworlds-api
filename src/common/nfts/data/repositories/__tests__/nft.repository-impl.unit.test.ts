/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NFT } from '@common/nfts/domain/entities/nft';
import { NftsNotFoundError } from '@common/nfts/domain/errors/nfts-not-found.error';
import { Failure } from '@core/architecture/domain/failure';
import { NftRepositoryImpl } from '../nft.repository-impl';

const blockTimestamp = new Date(1645815926208);
const nftParamsDto = {
  invalid: 0,
  error: 'error',
  delay: 0,
  difficulty: 1,
  ease: 1,
  luck: 1,
  commission: 1,
};
const nftTemplateDto = {
  cardid: 1,
  name: 'foo.nft',
  img: 'none',
  backimg: 'back-none',
  rarity: 'rare',
  shine: 'Stone',
  description: 'foo bar baz',
  attack: 100,
  defense: 200,
  class: 'some',
  movecost: 2,
  race: 'some',
  type: 'Manipulator',
  element: 'some',
  delay: 75,
  difficulty: 1,
  ease: 10,
  luck: 5,
} as any;
const nftDto = {
  miner: 'fake.foo',
  land_id: 'fake.land',
  params: nftParamsDto,
  rand1: 1,
  rand2: 2,
  rand3: 3,
  template_id: 11,
  block_num: 0,
  block_timestamp: blockTimestamp,
  global_sequence: 0,
  template_data: nftTemplateDto,
} as any;

describe('NftRepositoryImpl Unit tests', () => {
  it('Should add entity to the reposiotry and return it with assigned id', async () => {
    const fakeId = 'fake.id';
    const nftsMongoSourceMock = {
      insertOne: () => fakeId,
    } as any;
    const repository = new NftRepositoryImpl(nftsMongoSourceMock);
    const result = await repository.add(NFT.fromDto(nftDto));
    expect(result.content).toEqual({ id: fakeId, ...result.content });
  });

  it('Should return a failure whern adding an entity has failed', async () => {
    const fakeId = 'fake.id';
    const nftsMongoSourceMock = {
      insertOne: () => {
        throw new Error('some error');
      },
    } as any;
    const repository = new NftRepositoryImpl(nftsMongoSourceMock);
    const result = await repository.add(NFT.fromDto(nftDto));
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('Should return nfts', async () => {
    const nftsMongoSourceMock = {
      find: () => [nftDto],
    } as any;
    const queryModel = {
      toQueryParams: () => ({}),
    };
    const repository = new NftRepositoryImpl(nftsMongoSourceMock);
    const result = await repository.listNfts(queryModel as any);
    expect(result.content).toEqual([NFT.fromDto(nftDto)]);
  });

  it('Should result with a failure when no nfts were wound', async () => {
    const nftsMongoSourceMock = {
      find: () => [],
    } as any;
    const queryModel = {
      toQueryParams: () => ({}),
    };
    const repository = new NftRepositoryImpl(nftsMongoSourceMock);
    const result = await repository.listNfts(queryModel as any);
    expect(result.failure.error).toBeInstanceOf(NftsNotFoundError);
  });

  it('Should result with a failure when fetching nfts fails', async () => {
    const nftsMongoSourceMock = {
      find: () => {
        throw new Error('some error');
      },
    } as any;
    const queryModel = {
      toQueryParams: () => ({}),
    };
    const repository = new NftRepositoryImpl(nftsMongoSourceMock);
    const result = await repository.listNfts(queryModel as any);

    expect(result.isFailure).toBeTruthy();
  });

  it('Should return number of nfts', async () => {
    const nftsMongoSourceMock = {
      count: () => 1,
    } as any;
    const queryModel = {
      toQueryParams: () => ({}),
    };
    const repository = new NftRepositoryImpl(nftsMongoSourceMock);
    const result = await repository.countNfts(queryModel as any);
    expect(result.content).toEqual(1);
  });

  it('Should result with a failure when no nfts were wound', async () => {
    const nftsMongoSourceMock = {
      count: () => 0,
    } as any;
    const queryModel = {
      toQueryParams: () => ({}),
    };
    const repository = new NftRepositoryImpl(nftsMongoSourceMock);
    const result = await repository.countNfts(queryModel as any);
    expect(result.failure.error).toBeInstanceOf(NftsNotFoundError);
  });

  it('Should result with a failure when fetching nfts fails', async () => {
    const nftsMongoSourceMock = {
      count: () => {
        throw new Error('some error');
      },
    } as any;
    const queryModel = {
      toQueryParams: () => ({}),
    };
    const repository = new NftRepositoryImpl(nftsMongoSourceMock);
    const result = await repository.countNfts(queryModel as any);

    expect(result.isFailure).toBeTruthy();
  });
});
