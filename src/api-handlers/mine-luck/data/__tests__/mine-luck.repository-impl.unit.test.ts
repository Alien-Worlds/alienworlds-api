/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MineLuck } from '../../domain/entities/mine-luck';
import { MineLuckRepositoryImpl } from '../mine-luck.repository-impl';

const dto = {
  _id: 'foo_id',
  total_luck: 200,
  total_mines: 100,
  planets: ['foo', 'bar'],
  tools: [0, 1, 2],
  avg_luck: 30,
  rarities: ['rare'],
};

const minesMongoSourceMock = {
  aggregate: jest.fn(() => [dto]),
};

describe('MineLuckRepositoryImpl Unit tests', () => {
  it('Should result with the list of MineLuck entities', async () => {
    const repository = new MineLuckRepositoryImpl(minesMongoSourceMock as any);

    const result = await repository.getMineLuck(
      '2021-12-06T10:00:0.000Z',
      '2021-12-06T11:00:0.000Z'
    );

    expect(result.content).toEqual([MineLuck.fromDto(dto)]);
  });

  it('Should result with failure when data source operation fails', async () => {
    minesMongoSourceMock.aggregate.mockImplementation(() => {
      throw new Error('something went wrong');
    });
    const repository = new MineLuckRepositoryImpl(minesMongoSourceMock as any);

    const result = await repository.getMineLuck(
      '2021-12-06T10:00:0.000Z',
      '2021-12-06T11:00:0.000Z'
    );

    expect(result.isFailure).toEqual(true);
  });

  it('"buildMongoAggregationPipeline" should create a pipeline', async () => {
    minesMongoSourceMock.aggregate.mockImplementation(() => {
      throw new Error('something went wrong');
    });
    const repository = new MineLuckRepositoryImpl(minesMongoSourceMock as any);

    const pipeline = (repository as any).buildMongoAggregationPipeline(
      '2021-12-06T10:00:0.000Z',
      '2021-12-06T11:00:0.000Z'
    );

    expect(pipeline).toEqual([
      {
        $match: {
          block_timestamp: {
            $gte: new Date('2021-12-06T10:00:00.000Z'),
            $lt: new Date('2021-12-06T11:00:00.000Z'),
          },
        },
      },
      {
        $group: {
          _id: '$miner',
          bag_items: { $addToSet: '$bag_items' },
          planets: { $addToSet: '$planet_name' },
          total_luck: { $sum: '$params.luck' },
          total_mines: { $sum: 1 },
        },
      },
      { $match: { total_luck: { $gt: 0 } } },
      {
        $addFields: {
          avg_luck: { $divide: ['$total_luck', '$total_mines'] },
          tools: { $arrayElemAt: ['$bag_items', 0] },
        },
      },
      {
        $lookup: {
          as: 'rarities',
          foreignField: 'asset_id',
          from: 'assets',
          localField: 'tools',
        },
      },
      {
        $project: {
          _id: 1,
          avg_luck: 1,
          planets: 1,
          rarities: {
            $map: {
              as: 'asset',
              in: '$$asset.data.immutable_serialized_data.rarity',
              input: '$rarities',
            },
          },
          tools: 1,
          total_luck: 1,
          total_mines: 1,
        },
      },
    ]);
  });

  it('"buildMongoAggregationPipeline" should create a pipeline with block_timestamp greater than given value', async () => {
    minesMongoSourceMock.aggregate.mockImplementation(() => {
      throw new Error('something went wrong');
    });
    const repository = new MineLuckRepositoryImpl(minesMongoSourceMock as any);

    const pipeline = (repository as any).buildMongoAggregationPipeline(
      '2021-12-06T10:00:0.000Z'
    );

    expect(pipeline[0]['$match']['block_timestamp']['$gte']).toEqual(
      new Date('2021-12-06T10:00:00.000Z')
    );
  });

  it('"buildMongoAggregationPipeline" should create a pipeline with block_timestamp lower than given value', async () => {
    minesMongoSourceMock.aggregate.mockImplementation(() => {
      throw new Error('something went wrong');
    });
    const repository = new MineLuckRepositoryImpl(minesMongoSourceMock as any);

    const pipeline = (repository as any).buildMongoAggregationPipeline(
      null,
      '2021-12-06T11:00:0.000Z'
    );
    expect(pipeline[0]['$match']['block_timestamp']['$lt']).toEqual(
      new Date('2021-12-06T11:00:00.000Z')
    );
  });
});
