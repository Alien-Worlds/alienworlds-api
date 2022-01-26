import {
  createMineLuckPipeline,
  MineLuck,
  MineLuckResponse,
} from '../mineluck';
import {
  pipelineWithBlockTimestamps,
  pipelineWithoutBlockTimestamps,
} from './fixtures/aggregation-pipeline.fixture';
import { magorWorldCompleteMineluckDocument } from './fixtures/mineluck-document.fixture';
import {
  magorWorldCompleteMineluck,
  magorWorldWithoutRaritiesMineluck,
} from './fixtures/mineluck.fixture';

describe('MineLuck Unit tests', () => {
  it('MineLuck.fromDto should throw an error when DTO is not given', () => {
    const action = () => {
      MineLuck.fromDto(null);
    };
    expect(action).toThrowError();
  });

  it('MineLuck.fromDto should create instance of the MineLuck class based on given dto (MineLuckDocument)', () => {
    const mineluck = MineLuck.fromDto(magorWorldCompleteMineluckDocument);
    expect(mineluck).toEqual(magorWorldCompleteMineluck);
  });
});

describe('MineLuckResponse Unit tests', () => {
  it('MineLuckResponse.create should throw an error when MineLuck collection is not given', () => {
    const action = () => {
      MineLuckResponse.create(null);
    };
    expect(action).toThrowError();
  });

  it('MineLuckResponse "count" should be equal to results.length', () => {
    expect(MineLuckResponse.create([magorWorldCompleteMineluck]).count).toEqual(
      1
    );
    expect(
      MineLuckResponse.create([
        magorWorldCompleteMineluck,
        magorWorldWithoutRaritiesMineluck,
      ]).count
    ).toEqual(2);
  });

  it('MineLuckResponse.create should create instance of the MineLuckResponse class based on given MineLuck collection', () => {
    expect(
      MineLuckResponse.create([
        magorWorldCompleteMineluck,
        magorWorldWithoutRaritiesMineluck,
      ])
    ).toEqual({
      results: [magorWorldCompleteMineluck, magorWorldWithoutRaritiesMineluck],
      count: 2,
    });
  });
});

describe('createMineLuckPipeline Unit tests', () => {
  it('createMineLuckPipeline should create mine luck aggregation pipeline without block timestamp range when "from" and "to" are not given', () => {
    expect(createMineLuckPipeline()).toEqual(pipelineWithoutBlockTimestamps);
  });

  it('createMineLuckPipeline should create mine luck aggregation pipeline with block timestamp range when "from" and "to" are given', () => {
    const from = '2022-01-20T19:29:41.294+00:00';
    const to = '2022-01-21T19:29:41.294+00:00';
    const fromTimestamp = 1642706981000;
    const toTimestamp = 1642793381000;

    expect(createMineLuckPipeline(from, to)).toEqual(
      pipelineWithBlockTimestamps(
        new Date(fromTimestamp),
        new Date(toTimestamp)
      )
    );
  });
});
