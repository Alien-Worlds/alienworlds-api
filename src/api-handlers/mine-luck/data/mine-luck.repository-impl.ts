import { MineMongoSource } from '@common/mines/data/data-sources/mine.mongo.source';
import { parseDateToMs } from '@common/utils/date.utils';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { MineLuck } from '../domain/entities/mine-luck';
import { MineLuckRepository } from '../domain/mine-luck.repository';

/**
 * @class
 */
export class MineLuckRepositoryImpl implements MineLuckRepository {
  /**
   * @constructor
   * @param {MineMongoSource} mineMongoSource
   */
  constructor(private mineMongoSource: MineMongoSource) {}

  /**
   *
   * @param {string} from
   * @param {string} to
   * @returns {Promise<Result<MineLuck[]>>}
   */
  public async getMineLuck(
    from: string,
    to: string
  ): Promise<Result<MineLuck[]>> {
    try {
      const dtos = await this.mineMongoSource.aggregate(
        this.buildMongoAggregationPipeline(from, to)
      );
      return Result.withContent(dtos.map(MineLuck.fromDto));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  private buildMongoAggregationPipeline(from?: string, to?: string): object[] {
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

    return pipeline;
  }
}
