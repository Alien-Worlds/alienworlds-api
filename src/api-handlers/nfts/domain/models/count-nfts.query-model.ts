import { NftDocument } from '@common/nfts/data/nfts.dtos';
import { MongoFindQueryParams } from '@core/storage/data/mongo.types';
import { GetNftsInput } from './get-nfts.input';
import { GetNftsQueryModel } from './get-nfts.query-model';

export class CountNftsQueryModel extends GetNftsQueryModel {
  /**
   *
   * @param options
   * @returns
   */
  public static create(model: GetNftsInput): CountNftsQueryModel {
    const {
      from,
      to,
      globalSequenceFrom,
      globalSequenceTo,
      miner,
      landId,
      rarity,
    } = model;

    return new CountNftsQueryModel(
      from,
      to,
      globalSequenceFrom,
      globalSequenceTo,
      miner,
      landId,
      rarity
    );
  }

  /**
   * @private
   * @constructor
   * @param options
   */
  protected constructor(
    public readonly from: string,
    public readonly to: string,
    public readonly globalSequenceFrom: number,
    public readonly globalSequenceTo: number,
    public readonly miner: string,
    public readonly landId: string,
    public readonly rarity: string
  ) {
    super(
      0,
      from,
      to,
      globalSequenceFrom,
      globalSequenceTo,
      miner,
      landId,
      rarity,
      1
    );
  }

  /**
   *
   * @returns
   */
  public toQueryParams(): MongoFindQueryParams<NftDocument> {
    const { filter } = super.toQueryParams();

    return {
      filter,
    };
  }
}
