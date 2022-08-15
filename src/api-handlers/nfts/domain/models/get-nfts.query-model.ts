import { NftDocument } from '@common/nfts/data/nfts.dtos';
import { MongoFindQueryParams } from '@core/storage/data/mongo.types';
import { FindOptions, Long } from 'mongodb';
import { NFTSearchQuery } from '../../data/nfts.dtos';
import { Rarity } from '../nfts.enums';
import { GetNftsInput } from './get-nfts.input';
import { QueryModel } from '@core/architecture/domain/query-model';

export class GetNftsQueryModel extends QueryModel {
  /**
   *
   * @param options
   * @returns
   */
  public static create(model: GetNftsInput): GetNftsQueryModel {
    const {
      limit,
      from,
      to,
      globalSequenceFrom,
      globalSequenceTo,
      miner,
      landId,
      rarity,
      sort,
    } = model;
    let sortingDirection = 0;

    if (sort && sort.toLowerCase() === 'asc') sortingDirection = 1;
    else if (sort && sort.toLowerCase() === 'desc') sortingDirection = -1;

    return new GetNftsQueryModel(
      limit,
      from,
      to,
      globalSequenceFrom,
      globalSequenceTo,
      miner,
      landId,
      rarity,
      <1 | -1 | 0>sortingDirection
    );
  }

  /**
   * @private
   * @constructor
   * @param options
   */
  protected constructor(
    public readonly limit: number,
    public readonly from: string,
    public readonly to: string,
    public readonly globalSequenceFrom: number,
    public readonly globalSequenceTo: number,
    public readonly miner: string,
    public readonly landId: string,
    public readonly rarity: string,
    public readonly sort: 1 | -1 | 0
  ) {
    super();
  }

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
  public toQueryParams(): MongoFindQueryParams<NftDocument> {
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
    } = this;
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

    if (from && to) {
      filter.block_timestamp = {
        $gte: new Date(Date.parse(from)),
        $lt: new Date(Date.parse(to)),
      };
    } else if (from && !to) {
      filter.block_timestamp = { $gte: new Date(Date.parse(from)) };
    } else if (!from && to) {
      filter.block_timestamp = { $lt: new Date(Date.parse(to)) };
    }

    if (globalSequenceFrom && globalSequenceTo) {
      filter.global_sequence = {
        $gte: Long.fromNumber(globalSequenceFrom),
        $lt: Long.fromNumber(globalSequenceTo),
      };
    } else if (globalSequenceFrom && !globalSequenceTo) {
      filter.global_sequence = { $gte: Long.fromNumber(globalSequenceFrom) };
    } else if (!globalSequenceFrom && globalSequenceTo) {
      filter.global_sequence = { $lt: Long.fromNumber(globalSequenceTo) };
    }

    const options: FindOptions = {};

    if (sort) {
      options.sort = { global_sequence: sort };
    }

    if (limit) {
      options.limit = limit;
    }

    return {
      filter,
      options,
    };
  }
}
