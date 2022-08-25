/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ListAssetsQueryModel } from '../list-assets.query-model';

describe('ListAssetsQueryModel Unit tests', () => {
  it('"toQueryParams" should return mongodb query parameters', async () => {
    const input = ListAssetsQueryModel.create('foo', 'foo_schema', 0, 1);

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
