/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ListMineLuckInput } from '../list-mine-luck.input';

describe('ListMineLuckInput Unit tests', () => {
  it('"ListMineLuckInput.fromDto" should create controller input data based on user data', async () => {
    const input = ListMineLuckInput.fromRequest({
      query: {
        from: '2021-06-17T01:05:38.000Z',
        to: '2021-06-17T02:05:38.000Z',
      },
    } as any);
    expect(input.from).toEqual('2021-06-17T01:05:38.000Z');
    expect(input.to).toEqual('2021-06-17T02:05:38.000Z');
  });
});
