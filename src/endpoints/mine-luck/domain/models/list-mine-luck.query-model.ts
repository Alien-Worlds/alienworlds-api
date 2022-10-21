import {
  MongoAggregateParams,
  parseDateToMs,
  QueryModel,
} from '@alien-worlds/api-core';

export class ListMineLuckQueryModel extends QueryModel {
  /**
   *
   * @param {string} from
   * @param {string} to
   * @returns
   */
  public static create(from?: string, to?: string): ListMineLuckQueryModel {
    return new ListMineLuckQueryModel(from, to);
  }

  /**
   * @private
   * @constructor
   * @param {string} from
   * @param {string} to
   */
  private constructor(
    private readonly from: string,
    private readonly to: string
  ) {
    super();
  }

  /**
   *
   * @returns
   */
  public toQueryParams(): MongoAggregateParams {
    const { from, to } = this;
    const query: { block_timestamp?: { $gte?: Date; $lt?: Date } } = {};

    if (from && to) {
      query.block_timestamp = {
        $gte: new Date(parseDateToMs(from)),
        $lt: new Date(parseDateToMs(to)),
      };
    } else if (!from && to) {
      query.block_timestamp = { $lt: new Date(parseDateToMs(to)) };
    } else if (from && !to) {
      query.block_timestamp = { $gte: new Date(parseDateToMs(from)) };
    }

    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: '$miner',
          total_luck: { $sum: '$params.luck' },
          total_mines: { $sum: 1 },
          planets: { $addToSet: '$planet_name' },
          bag_items: { $addToSet: '$bag_items' },
        },
      },
      { $match: { total_luck: { $gt: 0 } } },
      {
        $addFields: {
          tools: { $arrayElemAt: ['$bag_items', 0] },
          avg_luck: { $divide: ['$total_luck', '$total_mines'] },
        },
      },
      {
        $lookup: {
          from: 'assets',
          localField: 'tools',
          foreignField: 'asset_id',
          as: 'rarities',
        },
      },
      {
        $project: {
          _id: 1,
          total_luck: 1,
          avg_luck: 1,
          total_mines: 1,
          planets: 1,
          tools: 1,
          rarities: {
            $map: {
              input: '$rarities',
              as: 'asset',
              in: '$$asset.data.immutable_serialized_data.rarity',
            },
          },
        },
      },
    ];

    return { pipeline, options: { allowDiskUse: true } };
  }
}
