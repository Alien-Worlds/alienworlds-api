import { getSortingDirectionByString } from '@common/utils/api.utils';
import { NftsRequestOptionsDto } from '../../data/nfts.dtos';

/**
 * @class
 */
export class GetNftsInput {
  /**
   *
   * @param {NftsRequestOptionsDto} dto
   * @returns {GetNftsInput}
   */
  public static fromDto(dto: NftsRequestOptionsDto): GetNftsInput {
    const {
      limit,
      from,
      to,
      global_sequence_from,
      global_sequence_to,
      miner,
      land_id,
      sort,
      rarity,
    } = dto;
    return new GetNftsInput(
      limit || 20,
      from,
      to,
      global_sequence_from,
      global_sequence_to,
      miner,
      land_id,
      rarity,
      getSortingDirectionByString(sort)
    );
  }
  /**
   *
   * @constructor
   * @private
   * @param {string} from
   * @param {string} to
   */
  private constructor(
    public readonly limit: number,
    public readonly from: string,
    public readonly to: string,
    public readonly globalSequenceFrom: number,
    public readonly globalSequenceTo: number,
    public readonly miner: string,
    public readonly landId: string,
    public readonly rarity: string,
    public readonly sort: 1 | -1
  ) {}
}
