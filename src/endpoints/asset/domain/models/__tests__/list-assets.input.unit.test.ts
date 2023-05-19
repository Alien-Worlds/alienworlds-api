/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ListAssetsInput } from '../list-assets.input';

describe('ListAssetsInput Unit tests', () => {
  it('ListAssetsInput.fromRequest should create input with default values when none were given', async () => {
    const input = ListAssetsInput.fromRequest({} as any);

    expect(input).toEqual({
      limit: 20,
      offset: 0,
      owner: undefined,
      schema: undefined,
      assetIds: [],
    });
  });

  it('ListAssetsInput.fromRequest should parse given assetIds to BigInts and use other given values', async () => {
    const input = ListAssetsInput.fromRequest({
      query: {
        limit: 20,
        offset: 0,
        id: '1,2',
        owner: 'foo',
        schema: 'bar',
      },
    } as any);

    expect(input).toEqual({
      limit: 20,
      offset: 0,
      assetIds: [1n, 2n],
      owner: 'foo',
      schema: 'bar',
    });
  });
});
