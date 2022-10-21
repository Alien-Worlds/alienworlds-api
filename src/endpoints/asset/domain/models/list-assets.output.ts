import { Asset } from '@alien-worlds/alienworlds-api-common';
import { AssetResultDto } from '../../data/asset.dtos';

/**
 * @class
 */
export class ListAssetsOutput {
  /**
   *
   * @param {AssetRequestQueryOptionsDto} dto
   * @returns {ListAssetsOutput}
   */
  public static fromEntities(entities: Asset[]): ListAssetsOutput {
    return new ListAssetsOutput(
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
