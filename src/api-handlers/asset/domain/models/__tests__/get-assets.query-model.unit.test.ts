/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetAssetsQueryModel } from '../get-assets.query-model';

describe('GetAssetsQueryModel Unit tests', () => {
  it('"toQueryParams" should return mongodb query parameters', async () => {
    const input = GetAssetsQueryModel.create('foo', 'foo_schema', 0, 1);

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
});
