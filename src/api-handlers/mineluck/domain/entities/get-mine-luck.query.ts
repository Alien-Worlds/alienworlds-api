import { parseDateToMs } from '@common/utils/date.utils';
import { MongoAggregateArgs } from '@core/storage/data/mongo.types';

export class GetMineLuckQuery {
  /**
   *
   * @param from
   * @param to
   * @returns
   */
  public static create(from: string, to: string): GetMineLuckQuery {
    return new GetMineLuckQuery(from, to);
  }

  /**
   * @private
   * @constructor
   * @param from
   * @param to
   */
  private constructor(
    private readonly from: string,
    private readonly to: string
  ) {}

  /**
   *
   * @returns
   */
  public toMongoAggregateArgs(): MongoAggregateArgs {
    const { from, to } = this;
    const query: { block_timestamp?: { $gte?: Date; $lt?: Date } } = {};

    if (from) {
      if (typeof query.block_timestamp === 'undefined') {
        query.block_timestamp = {};
      }
      query.block_timestamp.$gte = new Date(parseDateToMs(from));
    }

    if (to) {
      if (typeof query.block_timestamp === 'undefined') {
        query.block_timestamp = {};
      }
      query.block_timestamp.$lt = new Date(parseDateToMs(to));
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

    return { pipeline };
  }
}
