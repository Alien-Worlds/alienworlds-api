import { Asset } from '@alien-worlds/alienworlds-api-common';
import { EntityNotFoundError, Result } from '@alien-worlds/api-core';

/**
 * @class
 */
export class ListAssetsOutput {
  public static create(result: Result<Asset[]>): ListAssetsOutput {
    return new ListAssetsOutput(result);
  }

  private constructor(public readonly result: Result<Asset[], Error>) {}

  public toResponse() {
    const { result } = this;
    if (result.isFailure) {
      if (result.failure.error instanceof EntityNotFoundError) {
        return {
          status: 200,
          body: { results: [] },
        };
      }
    }
    return {
      status: 200,
      body: {
        results: result.content.map(asset => {
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
          } = asset;

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
        }),
      },
    };
  }
}
