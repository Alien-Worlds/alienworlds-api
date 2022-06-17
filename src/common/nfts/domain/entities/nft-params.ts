import { removeUndefinedProperties } from '@common/utils/dto.utils';
import { NftParamsData } from '../../data/nfts.dtos';

/**
 * @class
 */
export class NftParams {
  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly invalid: number,
    public readonly error: string,
    public readonly delay: number,
    public readonly difficulty: number,
    public readonly ease: number,
    public readonly luck: number,
    public readonly commission: number
  ) {}

  /**
   * Get DTO from the entity
   *
   * @returns {NftParamsData}
   */
  public toDto(): NftParamsData {
    const dto: NftParamsData = {
      invalid: this.invalid,
      error: this.error,
      delay: this.delay,
      difficulty: this.difficulty,
      ease: this.ease,
      luck: this.luck,
      commission: this.commission,
    };

    // Remove undefined properties so as not to send them to the data source.
    // This should not happen - the only exception is the "_id" property
    // which may be undefined if the entity was created on the basis of
    // DTO without given id, e.g. from the message.

    return removeUndefinedProperties<NftParamsData>(dto);
  }

  /**
   * Create NFT params instance based on given DTO.
   *
   * @static
   * @param {NftParamsData} dto
   * @returns {NftParams}
   */
  public static fromDto(dto: NftParamsData): NftParams {
    const { invalid, error, delay, difficulty, ease, luck, commission } =
      dto || {};

    return new NftParams(
      invalid,
      error,
      delay,
      difficulty,
      ease,
      luck,
      commission
    );
  }
}
