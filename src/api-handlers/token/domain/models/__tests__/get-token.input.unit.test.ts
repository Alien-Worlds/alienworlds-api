/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { GetTokenInput } from '../get-token.input';

describe('GetTokenInput Unit tests', () => {
  it('"GetTokenInput.fromDto" should create controller input data based on user data', async () => {
    const input = GetTokenInput.fromDto({
      type: 'supply',
      offset: 0,
      id: 'foo_id',
      owner: 'foo_owner',
      schema: 'foo_schema',
    });
    expect(input).toEqual({
      type: 'supply',
      offset: 0,
      id: 'foo_id',
      owner: 'foo_owner',
      schema: 'foo_schema',
    });
  });
});
