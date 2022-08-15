import { Asset } from '@common/assets/domain/entities/asset';
import { AssetResultDto } from '../../data/asset.dtos';

/**
 * @class
 */
export class GetAssetsOutput {
  /**
   *
   * @param {AssetRequestQueryOptionsDto} dto
   * @returns {GetAssetsOutput}
   */
  public static fromEntities(entities: Asset[]): GetAssetsOutput {
    return new GetAssetsOutput(
      entities.map(asset => this.entityToAssetResultJson(asset))
    );
  }

  private static entityToAssetResultJson(entity: Asset): AssetResultDto {
    const {
      assetId,
      owner,
      data: {
        collectionName,
        schemaName,
        templateId,
        immutableSerializedData: {
          cardId,
          name,
          image,
          backImage,
          rarity,
          shine,
          type,
          delay,
          difficulty,
          ease,
          luck,
        },
      },
    } = entity;

    return {
      collection_name: collectionName,
      schema_name: schemaName,
      template_id: templateId,
      asset_id: Number(assetId),
      owner,
      data: {
        cardid: cardId,
        name,
        img: image,
        backimg: backImage,
        rarity,
        shine,
        type,
        delay,
        difficulty,
        ease,
        luck,
      },
    };
  }

  /**
   *
   * @constructor
   * @private
   * @param {AssetResultDto[]} results
   */
  private constructor(public readonly results: AssetResultDto[]) {}

  public toJson() {
    return {
      results: this.results,
    };
  }
}
