import { getNFTsFastifyMock } from './mocks/nfts.fastify.mock';
import {
  nftsRequestQueryOptions,
  nftsSearchQuery,
  noFromTimestampsNftsRequestQueryOptions,
  noFromTimestampsNftsSearchQuery,
  sampleNFT,
  sampleNFTDocument,
  sampleNFTResult,
  sampleNFTsResponse,
  wrongRarityNftsRequestQueryOptions,
} from './fixtures/nfts.fixture';
import {
  buildQuery,
  getNFTs,
  isValidRarity,
  getSortingDirectionByString,
  NFT,
  NFTResult,
  NFTsResponse,
  countNFTs,
} from '../nfts';

describe('NFT unit tests', () => {
  it('NFT.fromDto should return NFT entity based on data provided in given NFTDocument dto', async () => {
    expect(NFT.fromDto(sampleNFTDocument)).toEqual(sampleNFT);
  });
});

describe('NFTResult unit tests', () => {
  it('NFTResult.fromEntity should return NFTResult model based on given NFT entity', async () => {
    expect(NFTResult.fromEntity(sampleNFT)).toEqual(sampleNFTResult);
  });
});

describe('NFTsResponse unit tests', () => {
  it('NFTsResponse.create should return NFTsResponse model based on given NFT entities', async () => {
    expect(NFTsResponse.create([sampleNFT], 1000)).toEqual(sampleNFTsResponse);
  });
});

describe('"getSortingDirectionByString" unit tests', () => {
  it('Should return 1 when given value is "asc" or any other variations', async () => {
    expect(getSortingDirectionByString('asc')).toEqual(1);
    expect(getSortingDirectionByString('ASC')).toEqual(1);
    expect(getSortingDirectionByString('Asc')).toEqual(1);
  });

  it('Should return 1 when given value is "desc" or any other variations', async () => {
    expect(getSortingDirectionByString('desc')).toEqual(-1);
    expect(getSortingDirectionByString('DESC')).toEqual(-1);
    expect(getSortingDirectionByString('Desc')).toEqual(-1);
  });

  it('It should throw an error when an invalid value is given', async () => {
    const action = () => {
      getSortingDirectionByString('%$#');
    };
    expect(action).toThrowError();
  });
});

describe('"isValidRarity" unit tests', () => {
  it('Should return true when given value is one of the valid rarity types', async () => {
    expect(isValidRarity('Abundant')).toEqual(true);
    expect(isValidRarity('Common')).toEqual(true);
    expect(isValidRarity('Rare')).toEqual(true);
    expect(isValidRarity('Epic')).toEqual(true);
    expect(isValidRarity('Legendary')).toEqual(true);
  });

  it('Should return false when an invalid value is give', async () => {
    expect(isValidRarity('Bieszczady')).toEqual(false);
  });
});

describe('"getNFTs" unit tests', () => {
  it('Should return collection of NFT entities', async () => {
    const collection = await getNFTs(
      getNFTsFastifyMock({ findResult: [sampleNFTDocument] }),
      {}
    );

    expect(collection).toEqual([sampleNFT]);
  });

  it('It should throw an error when an given limit option is > 1000', async () => {
    await getNFTs(getNFTsFastifyMock({ findResult: [] }), {
      query: { limit: 1001 },
    }).catch(error => {
      expect(error).toBeInstanceOf(Error);
    });
  });
});

describe('"countNFTs" unit tests', () => {
  it('Should return number of documents', async () => {
    const count = await countNFTs(
      getNFTsFastifyMock({ countResult: 1000 }),
      {}
    );
    expect(count).toEqual(1000);
  });
});

describe('"buildQuery" unit tests', () => {
  it('Should return empty query when no options are given', async () => {
    expect(buildQuery({})).toEqual({});
  });

  it('Should build a query based on given options', async () => {
    expect(buildQuery(nftsRequestQueryOptions)).toEqual(nftsSearchQuery);
  });

  it('Should build a query based on given options without from and global_sequence_from', async () => {
    expect(buildQuery(noFromTimestampsNftsRequestQueryOptions)).toEqual(
      noFromTimestampsNftsSearchQuery
    );
  });

  it('It should throw an error when an invalid rarity is given', async () => {
    const action = () => {
      buildQuery(wrongRarityNftsRequestQueryOptions);
    };
    expect(action).toThrowError();
  });
});
