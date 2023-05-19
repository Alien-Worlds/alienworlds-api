/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Asset, AssetData } from '@alien-worlds/alienworlds-api-common';
import { ListAssetsOutput } from '../list-assets.output';
import { Result } from '@alien-worlds/api-core';

const assetDataDto = {
  collection_name: 'foo_collection',
  schema_name: 'foo_schema',
  template_id: 0,
  immutable_serialized_data: {
    cardid: 12,
    name: 'foo_name',
    img: 'foo_img',
    backimg: 'foo_backimg',
    rarity: 'rare',
    shine: 'foo_shine',
    type: 'foo_type',
    delay: 0,
    difficulty: 0,
    ease: 0,
    luck: 0,
  },
};

describe('ListAssetsOutput Unit tests', () => {
  it('ListAssetsOutput.create should create input with default values when none were given', async () => {
    const output = ListAssetsOutput.create(
      Result.withContent([
        Asset.create(1n, 'foo', AssetData.fromDto(assetDataDto)),
      ])
    );

    expect(output.toResponse()).toEqual({
      body: {
        results: [
          {
            asset_id: 1,
            collection_name: 'foo_collection',
            data: {
              backimg: 'foo_backimg',
              cardid: 12,
              delay: 0,
              difficulty: 0,
              ease: 0,
              img: 'foo_img',
              luck: 0,
              name: 'foo_name',
              rarity: 'rare',
              shine: 'foo_shine',
              type: 'foo_type',
            },
            owner: 'foo',
            schema_name: 'foo_schema',
            template_id: 0,
          },
        ],
      },
      status: 200,
    });
  });

  it('"toJson" should return json representation of the output', async () => {
    const output = ListAssetsOutput.create(
      Result.withContent([
        Asset.create(1n, 'foo', AssetData.fromDto(assetDataDto)),
      ])
    );

    expect(output.toResponse()).toEqual({
      body: {
        results: [
          {
            asset_id: 1,
            collection_name: 'foo_collection',
            data: {
              backimg: 'foo_backimg',
              cardid: 12,
              delay: 0,
              difficulty: 0,
              ease: 0,
              img: 'foo_img',
              luck: 0,
              name: 'foo_name',
              rarity: 'rare',
              shine: 'foo_shine',
              type: 'foo_type',
            },
            owner: 'foo',
            schema_name: 'foo_schema',
            template_id: 0,
          },
        ],
      },
      status: 200,
    });
  });
});
