import { AssetSerializedDataSubDocument } from '@common/assets/data/assets.dtos';
import { removeUndefinedProperties } from '@common/utils/dto.utils';

/**
 * Represents immutable serialized data entity.
 * @class
 */
export class ImmutableSerializedData {
  [key: string]: unknown;

  private constructor(
    public readonly cardId: number,
    public readonly name: string,
    public readonly image: string,
    public readonly backImage: string,
    public readonly rarity: string,
    public readonly shine: string,
    public readonly type: string,
    public readonly delay: number,
    public readonly difficulty: number,
    public readonly ease: number,
    public readonly luck: number
  ) {}
  /**
   * Create DTO based on entity data
   *
   * @returns {AssetSerializedDataSubDocument}
   */
  public toDto(): AssetSerializedDataSubDocument {
    const dto = {
      cardid: this.cardId,
      name: this.name,
      img: this.image,
      backimg: this.backImage,
      rarity: this.rarity,
      shine: this.shine,
      type: this.type,
      delay: this.delay,
      difficulty: this.difficulty,
      ease: this.ease,
      luck: this.luck,
    };

    // Remove undefined properties so as not to send them to the data source.
    // This should not happen - the only exception is the "_id" property
    // which may be undefined if the entity was created on the basis of
    // DTO without given id, e.g. from the message.

    return removeUndefinedProperties<AssetSerializedDataSubDocument>(dto);
  }

  /**
   * Creates ImmutableSerializedData instance based on given
   * AssetSerializedDataSubDocument.
   *
   * @static
   * @public
   * @param {AssetSerializedDataSubDocument} dto
   * @returns {ImmutableSerializedData} instance of ImmutableSerializedData
   */
  public static fromDto(
    dto: AssetSerializedDataSubDocument
  ): ImmutableSerializedData {
    const {
      cardid,
      name,
      img,
      backimg,
      rarity,
      shine,
      type,
      delay,
      difficulty,
      ease,
      luck,
    } = dto;

    return new ImmutableSerializedData(
      cardid,
      name,
      img,
      backimg,
      rarity,
      shine,
      type,
      delay,
      difficulty,
      ease,
      luck
    );
  }
}
