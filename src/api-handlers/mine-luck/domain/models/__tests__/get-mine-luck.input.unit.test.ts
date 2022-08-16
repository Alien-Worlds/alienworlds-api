/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { GetMineLuckInput } from '../get-mine-luck.input';

describe('GetMineLuckInput Unit tests', () => {
  it('"GetMineLuckInput.fromDto" should create controller input data based on user data', async () => {
    const input = GetMineLuckInput.fromDto({
      query: {
        from: '2021-06-17T01:05:38.000Z',
        to: '2021-06-17T02:05:38.000Z',
      },
    });
    expect(input.from).toEqual('2021-06-17T01:05:38.000Z');
    expect(input.to).toEqual('2021-06-17T02:05:38.000Z');
  });
});
