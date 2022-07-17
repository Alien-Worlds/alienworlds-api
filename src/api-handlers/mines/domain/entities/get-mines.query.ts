import { MineDocument } from '@common/mines/data/mines.dtos';
import { Mine } from '@common/mines/domain/entities/mine';
import { parseDateToMs } from '@common/utils/date.utils';
import { MongoFindQueryArgs } from '@core/storage/data/mongo.types';
import { MinesSearchQuery } from 'api-handlers/mines/data/mines.dtos';
import { GetMinesOptions } from './mines-request-options';

export class GetMinesQuery {
  /**
   *
   * @param options
   * @returns
   */
  public static create(options: GetMinesOptions): GetMinesQuery {
    return new GetMinesQuery(options);
  }

  /**
   * @private
   * @constructor
   * @param options
   */
  private constructor(private readonly options: GetMinesOptions) {}

  /**
   *
   * @returns
   */
  public toArgs(): MongoFindQueryArgs<MineDocument> {
    const {
      from,
      to,
      globalSequenceFrom,
      globalSequenceTo,
      miner,
      landowner,
      landId,
      planetName,
      txId,
    } = this.options;
    let filter: MinesSearchQuery = {};

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
    if (from) {
      filter.block_timestamp = { $gte: new Date(parseDateToMs(from)) };
    }
    if (to && filter.block_timestamp) {
      filter.block_timestamp.$lt = new Date(parseDateToMs(to));
    } else if (to && !filter.block_timestamp) {
      filter.block_timestamp = {
        $lt: new Date(parseDateToMs(to)),
      };
    }

    if (globalSequenceFrom) {
      filter.global_sequence = { $gte: globalSequenceFrom };
    }

    if (globalSequenceTo && filter.global_sequence) {
      filter.global_sequence.$lt = globalSequenceTo;
    } else if (globalSequenceTo && !filter.global_sequence) {
      filter.global_sequence = { $lt: globalSequenceTo };
    }

    if (txId) {
      filter = { tx_id: txId };
    }

    return { filter };
  }
}
