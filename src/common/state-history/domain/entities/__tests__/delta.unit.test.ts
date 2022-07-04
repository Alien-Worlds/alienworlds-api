/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Delta } from '../delta';

describe('Delta Unit tests', () => {
  it('"create" should create Delta entity based on given DTO', async () => {
    const entity = Delta.create('foo', {
      name: 'delta',
      rows: [{ present: true, data: Uint8Array.from([]) }],
    });
    expect(entity).toBeInstanceOf(Delta);
  });
});
