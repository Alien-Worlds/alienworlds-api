import { NftDocument } from '@common/nfts/data/nfts.dtos';
import { MongoFindQueryArgs } from '@core/storage/data/mongo.types';
import { Long } from 'mongodb';
import { NFTSearchQuery } from '../../data/nfts.dtos';
import { Rarity } from '../nfts.enums';
import { GetNftsInput } from './get-nfts.input';

export class GetNftsQuery {
  /**
   *
   * @param options
   * @returns
   */
  public static create(options: GetNftsInput): GetNftsQuery {
    return new GetNftsQuery(options);
  }

  /**
   * @private
   * @constructor
   * @param options
   */
  private constructor(private readonly options: GetNftsInput) {}

  /**
   * Checks if provided value matches any of the rarity types
   * ['Abundant', 'Common', 'Rare', 'Epic', 'Legendary']
   *
   * @param {string} value
   * @returns {boolean}
   */
  private isValidRarity(value: string): value is Rarity {
    return Object.keys(Rarity).includes(value);
  }

  /**
   *
   * @returns
   */
  public toArgs(): MongoFindQueryArgs<NftDocument> {
    const {
      from,
      to,
      globalSequenceFrom,
      globalSequenceTo,
      miner,
      landId,
      rarity,
      sort,
      limit,
    } = this.options;
    const filter: NFTSearchQuery = {};

    if (miner) {
      filter.miner = miner;
    }
    if (rarity) {
      if (this.isValidRarity(rarity)) {
        filter['template_data.rarity'] = rarity;
      } else {
        throw new Error(`Rarity parameter must be ${Object.keys(Rarity)}`);
      }
    }
    if (landId) {
      filter.land_id = { $in: landId.split(',') };
    }
    if (from) {
      filter.block_timestamp = { $gte: new Date(Date.parse(from)) };
    }
    if (to && filter.block_timestamp) {
      filter.block_timestamp.$lt = new Date(Date.parse(to));
    } else if (to && !filter.block_timestamp) {
      filter.block_timestamp = {
        $lt: new Date(Date.parse(to)),
      };
    }

    if (globalSequenceFrom) {
      filter.global_sequence = { $gte: Long.fromNumber(globalSequenceFrom) };
    }

    if (globalSequenceTo && filter.global_sequence) {
      filter.global_sequence.$lt = Long.fromNumber(globalSequenceTo);
    } else if (globalSequenceTo && !filter.global_sequence) {
      filter.global_sequence = { $lt: Long.fromNumber(globalSequenceTo) };
    }

    return {
      filter,
      options: {
        sort: [['global_sequence', sort]],
        limit,
      },
    };
  }
}
