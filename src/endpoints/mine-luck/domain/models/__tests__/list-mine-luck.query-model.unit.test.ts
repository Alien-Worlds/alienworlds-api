/* eslint-disable @typescript-eslint/no-explicit-any */
import { ListMineLuckQueryModel } from '../list-mine-luck.query-model';

const params = {
  pipeline: [
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
  ],
  options: {
    allowDiskUse: true,
  },
};

describe('ListMineLuckQueryModel Unit tests', () => {
  it('"toQueryParams" should return mongodb query parameters', async () => {
    let input: ListMineLuckQueryModel;
    input = ListMineLuckQueryModel.create(
      '2021-12-06T10:00:00.000Z',
      '2021-12-06T11:00:00.000Z'
    );
    expect(input.toQueryParams()).toEqual(params);
    //
    delete params.pipeline[0].$match.block_timestamp.$lt;
    input = ListMineLuckQueryModel.create('2021-12-06T10:00:00.000Z');
    expect(input.toQueryParams()).toEqual(params);
    //
    params.pipeline[0].$match.block_timestamp.$lt = new Date(
      '2021-12-06T11:00:00.000Z'
    );
    delete params.pipeline[0].$match.block_timestamp.$gte;
    input = ListMineLuckQueryModel.create(null, '2021-12-06T11:00:00.000Z');
    expect(input.toQueryParams()).toEqual(params);
  });
});
