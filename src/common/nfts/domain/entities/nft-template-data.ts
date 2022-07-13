import { TemplateDataDocument } from '@common/nfts/data/nfts.dtos';
import { removeUndefinedProperties } from '@common/utils/dto.utils';

/**
 * @class
 */
export class NftTemplateData {
  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly cardId: number,
    public readonly name: string,
    public readonly image: string,
    public readonly backImage: string,
    public readonly rarity: string,
    public readonly shine: string,
    public readonly description: string,
    public readonly attack: number,
    public readonly defense: number,
    public readonly className: string,
    public readonly moveCost: number,
    public readonly race: string,
    public readonly type: string,
    public readonly element: string,
    public readonly delay: number,
    public readonly difficulty: number,
    public readonly ease: number,
    public readonly luck: number
  ) {}

  /**
   * Get DTO from the entity.
   *
   * @returns {TemplateDataDocument}
   */
  public toDto(): TemplateDataDocument {
    const dto: TemplateDataDocument = {
      cardid: this.cardId,
      name: this.name,
      img: this.image,
      backimg: this.backImage,
      rarity: this.rarity,
      shine: this.shine,
      description: this.description,
      attack: this.attack,
      defense: this.defense,
      class: this.className,
      movecost: this.moveCost,
      race: this.race,
      type: this.type,
      element: this.element,
      delay: this.delay,
      difficulty: this.difficulty,
      ease: this.ease,
      luck: this.luck,
    };

    // Remove undefined properties so as not to send them to the data source.
    // This should not happen - the only exception is the "_id" property
    // which may be undefined if the entity was created on the basis of
    // DTO without given id, e.g. from the message.

    return removeUndefinedProperties<TemplateDataDocument>(dto);
  }

  /**
   * Create deserialized NFT template data based on the DTO
   *
   * @param {TemplateDataDocument} dto
   * @returns {NftTemplateData}
   */
  public static fromDto(dto: TemplateDataDocument): NftTemplateData {
    return new NftTemplateData(
      dto.cardid,
      dto.name,
      dto.img,
      dto.backimg,
      dto.rarity,
      dto.shine,
      dto.description,
      dto.attack,
      dto.defense,
      dto.class,
      dto.movecost,
      dto.race,
      dto.type,
      dto.element,
      dto.delay,
      dto.difficulty,
      dto.ease,
      dto.luck
    );
  }
}
