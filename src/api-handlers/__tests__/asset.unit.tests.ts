import { getAssetsFastifyMock } from './mocks/asset.fastify.mock';
import {
  Asset,
  AssetResponse,
  AssetResult,
  buildLongIntListFromString,
  getAssetsCollection,
} from '../asset/asset';
import {
  emptyAssetResponse,
  long_0,
  long_1099535583633,
  long_1099624236152,
  sampleAsset,
  sampleAssetDocument,
  sampleAssetResponse,
  sampleAssetResult,
  standardShovelAsset,
  standardShovelAssetDocument,
} from './fixtures/asset.fixture';

describe('AssetResult unit tests', () => {
  it('AssetResult.fromEntity should return AssetResult object based on data provided in given Asset entity', async () => {
    expect(AssetResult.fromEntity(sampleAsset)).toEqual(sampleAssetResult);
  });
});

describe('Asset unit tests', () => {
  it('Asset.fromDto should return Asset object based on data provided in given AssetDocument dto', async () => {
    expect(Asset.fromDto(sampleAssetDocument)).toEqual(sampleAsset);
  });
});

describe('AssetResponse unit tests', () => {
  it('AssetResponse.create should return AssetResponse object based on given Asset collection', async () => {
    expect(AssetResponse.create([sampleAsset])).toEqual(sampleAssetResponse);
  });

  it('AssetResponse.create should return empty AssetResponse object when given asset collection is empty', async () => {
    expect(AssetResponse.create([])).toEqual(emptyAssetResponse);
  });
});

describe('"buildLongIntListFromString" unit tests', () => {
  it('Should return AssetResponse object based on given Asset collection', async () => {
    expect(buildLongIntListFromString('1099535583633,1099624236152')).toEqual([
      long_1099535583633,
      long_1099624236152,
    ]);
  });

  it('Should return single', async () => {
    expect(buildLongIntListFromString('1099624236152')).toEqual([
      long_1099624236152,
    ]);
  });

  it('Should throw error when null given', async () => {
    const action = () => {
      buildLongIntListFromString(null);
    };
    expect(action).toThrowError();
  });

  it('Should return 0 when wrong input given', async () => {
    expect(buildLongIntListFromString('#$%^&')).toEqual([long_0]);
  });
});

describe('"getAssetsCollection" unit tests', () => {
  it('Should return empty collection when no options were given', async () => {
    const findResult = [];
    const collection = await getAssetsCollection(
      getAssetsFastifyMock({ findResult }),
      {}
    );

    expect(collection).toEqual([]);
  });

  it('Should return empty Asset collection when no documents were found', async () => {
    const findResult = [];
    const collection = await getAssetsCollection(
      getAssetsFastifyMock({ findResult }),
      {
        query: {
          owner: 'fakeowner0',
        },
      }
    );

    expect(collection).toEqual([]);
  });

  it('Should throw an error when no document with the given "id" was found', async () => {
    const findResult = [];
    await getAssetsCollection(getAssetsFastifyMock({ findResult }), {
      query: {
        id: '61f7f245a92817601180e8eb',
      },
    }).catch(error => {
      expect(error).toBeInstanceOf(Error);
    });
  });

  it('Should return the asset collection of the given "owner"', async () => {
    const findResult = [standardShovelAssetDocument, sampleAssetDocument];
    const collection = await getAssetsCollection(
      getAssetsFastifyMock({ findResult }),
      {
        query: {
          owner: 'fakeowner0',
        },
      }
    );

    expect(collection).toEqual(
      expect.arrayContaining([standardShovelAsset, sampleAsset])
    );
  });

  it('Should return one asset of the given "owner" when a "limit" is given', async () => {
    const findResult = [standardShovelAssetDocument, sampleAssetDocument];
    const collection = await getAssetsCollection(
      getAssetsFastifyMock({ findResult }),
      {
        query: {
          owner: 'fakeowner0',
          limit: 1,
        },
      }
    );

    expect(collection).toEqual([standardShovelAsset]);
  });

  it('Should return second asset of the given "owner" when a "limit" and "offset" are given', async () => {
    const findResult = [standardShovelAssetDocument, sampleAssetDocument];
    const collection = await getAssetsCollection(
      getAssetsFastifyMock({ findResult }),
      {
        query: {
          owner: 'fakeowner0',
          limit: 1,
          offset: 1,
        },
      }
    );

    expect(collection).toEqual([sampleAsset]);
  });

  it('Should return the collection of assets of the given "owner" matching the given "schema"', async () => {
    const findResult = [sampleAssetDocument];
    const collection = await getAssetsCollection(
      getAssetsFastifyMock({ findResult }),
      {
        query: {
          owner: 'fakeowner0',
          schema: 'tools.worlds',
        },
      }
    );

    expect(collection).toEqual([sampleAsset]);
  });
});
