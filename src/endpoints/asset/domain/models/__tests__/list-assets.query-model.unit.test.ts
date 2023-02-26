/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MongoDB } from '@alien-worlds/api-core';
import { ListAssetsQueryModel } from '../list-assets.query-model';

describe('ListAssetsQueryModel Unit tests', () => {
  it('"toQueryParams" should return mongodb query parameters', async () => {
    const input = ListAssetsQueryModel.create({
      owner: 'foo',
      schema: 'foo_schema',
      skip: 0,
      limit: 1,
    });

    expect(input.toQueryParams()).toEqual({
      filter: {
        'data.schema_name': 'foo_schema',
        owner: 'foo',
      },
      options: {
        limit: 1,
        skip: 0,
      },
    });
  });

  it('"toQueryParams" should return mongodb query parameters with asset_id', async () => {
    const input = ListAssetsQueryModel.create({ assetIds: [0n, 1n] });

    expect(input.toQueryParams()).toEqual({
      filter: {
        asset_id: {
          $in: [MongoDB.Long.fromBigInt(0n), MongoDB.Long.fromBigInt(1n)],
        },
      },
      options: {},
    });
  });
});
