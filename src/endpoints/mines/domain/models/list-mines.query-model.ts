import { MineDocument } from '@alien-worlds/alienworlds-api-common';
import {
  Filter,
  FindOptions,
  Long,
  MongoFindQueryParams,
  parseDateToMs,
  QueryModel,
} from '@alien-worlds/api-core';
import { ListMinesInput } from './list-mines.input';

export class ListMinesQueryModel extends QueryModel {
  /**
   *
   * @param {MinesRequestDto} model
   * @returns {ListMinesInput}
   */
  public static create(model: ListMinesInput): ListMinesQueryModel {
    const {
      limit,
      from,
      to,
      globalSequenceFrom,
      globalSequenceTo,
      miner,
      landowner,
      landId,
      planetName,
      txId,
      sort,
    } = model;

    return new ListMinesQueryModel(
      limit,
      from,
      to,
      globalSequenceFrom,
      globalSequenceTo,
      miner,
      landowner,
      landId,
      planetName,
      txId,
      sort
    );
  }

  /**
   *
   * @constructor
   * @private
   */
  private constructor(
    public readonly limit: number,
    public readonly from: string,
    public readonly to: string,
    public readonly globalSequenceFrom: number,
    public readonly globalSequenceTo: number,
    public readonly miner: string,
    public readonly landowner: string,
    public readonly landId: string,
    public readonly planetName: string,
    public readonly txId: string,
    public readonly sort: string
  ) {
    super();
  }

  public toQueryParams(): MongoFindQueryParams<MineDocument> {
    const {
      limit,
      from,
      to,
      globalSequenceFrom,
      globalSequenceTo,
      miner,
      landowner,
      landId,
      planetName,
      txId,
      sort,
    } = this;

    const filter: Filter<MineDocument> = {};

    if (miner) {
      filter.miner = miner;
    }
    if (landowner) {
      filter.landowner = { $in: landowner.split(',') };
    }
    if (landId) {
      filter.land_id = { $in: landId.split(',') };
    }
    if (planetName) {
      filter.planet_name = planetName;
    }

    if (from && to) {
      filter.block_timestamp = {
        $gte: new Date(parseDateToMs(from)),
        $lt: new Date(parseDateToMs(to)),
      };
    } else if (from && !to) {
      filter.block_timestamp = { $gte: new Date(parseDateToMs(from)) };
    } else if (!from && to) {
      filter.block_timestamp = { $lt: new Date(parseDateToMs(to)) };
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

    if (txId) {
      filter.tx_id = txId;
    }

    const options: FindOptions = {};

    if (limit) {
      options.limit = Number(limit);
    }

    if (sort && sort.toLowerCase() === 'asc') {
      options.sort = { global_sequence: 1 };
    } else {
      options.sort = { global_sequence: -1 };
    }

    return { filter, options };
  }
}
