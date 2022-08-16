/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetAssetsInput } from '../get-assets.input';

describe('GetAssetsInput Unit tests', () => {
  it('GetAssetsInput.fromRequest should create input with default values when none were given', async () => {
    const input = GetAssetsInput.fromRequest({});

    expect(input).toEqual({
      limit: 20,
      offset: 0,
      owner: undefined,
      schema: undefined,
      assetIds: [],
    });
  });

  it('GetAssetsInput.fromRequest should parse given assetIds to BigInts and use other given values', async () => {
    const input = GetAssetsInput.fromRequest({
      limit: 20,
      offset: 0,
      id: '1,2',
      owner: 'foo',
      schema: 'bar',
    });

    expect(input).toEqual({
      limit: 20,
      offset: 0,
      assetIds: [1n, 2n],
      owner: 'foo',
      schema: 'bar',
    });
  });
});
