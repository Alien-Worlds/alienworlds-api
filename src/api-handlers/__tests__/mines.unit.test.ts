/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMinesFastifyMock } from './mocks/mines.fastify.mock';
import {
  notransactionIdMinerSearchQuery,
  notransactionIdMinesRequestQueryOptions,
  onlytransactionIdMinerSearchQuery,
  onlytransactionIdMinesRequestQueryOptions,
  sampleMine,
  sampleMineDocument,
  sampleMineResult,
  sampleMinesResponse,
} from './fixtures/mines.fixture';
import {
  buildQuery,
  getMinesCollection,
  getSortingDirectionByString,
  MineResult,
  MinesResponse,
} from '../mines';
import { Mine } from '@common/mines/domain/entities/mine';

describe('Mine unit tests', () => {
  it('Mine.fromDto should return Mine entity based on data provided in given MineDocument dto', async () => {
    expect(Mine.fromDto(sampleMineDocument)).toEqual(sampleMine);
  });
});

describe('MineResult unit tests', () => {
  it('MineResult.fromEntity should return MineResult model based on given Mine entity', async () => {
    expect(MineResult.fromEntity(sampleMine)).toEqual(sampleMineResult);
  });
});

describe('MinesResponse unit tests', () => {
  it('MinesResponse.create should return MinesResponse model based on given Mine entities', async () => {
    expect(MinesResponse.create([sampleMine])).toEqual(sampleMinesResponse);
  });

  it('Should contain count parameter equal to -1 when given Mine entity collection is not empty', async () => {
    expect(MinesResponse.create([sampleMine]).count).toEqual(-1);
  });

  it('Should contain count parameter equal to -1 when given Mine entity collection is empty', async () => {
    expect(MinesResponse.create([]).count).toEqual(-1);
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

describe('"getMinesCollection" unit tests', () => {
  it('Should return collection of Mine entities', async () => {
    const collection = await getMinesCollection(
      getMinesFastifyMock({ findResult: [sampleMineDocument] }),
      {}
    );

    expect(collection).toEqual([sampleMine]);
  });

  it('It should throw an error when an given limit option is > 5000', async () => {
    await getMinesCollection(getMinesFastifyMock({ findResult: [] }), {
      query: { limit: 5001 },
    }).catch(error => {
      expect(error).toBeInstanceOf(Error);
    });
  });
});

describe('"buildQuery" unit tests', () => {
  it('Should return empty query when no options are given', async () => {
    expect(buildQuery({})).toEqual({});
  });

  it('Should build a query containing only the transaction ID "tx_id" when given in options', async () => {
    expect(buildQuery(onlytransactionIdMinesRequestQueryOptions)).toEqual(
      onlytransactionIdMinerSearchQuery
    );
  });

  it('Should build a query based on a given options without "tx_id"', async () => {
    expect(buildQuery(notransactionIdMinesRequestQueryOptions)).toEqual(
      notransactionIdMinerSearchQuery
    );
  });
});
