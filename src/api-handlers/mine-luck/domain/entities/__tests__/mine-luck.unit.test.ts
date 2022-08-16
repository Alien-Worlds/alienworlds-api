/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MineLuck } from '../mine-luck';

const dto = {
  _id: 'foo_id',
  total_luck: 200,
  total_mines: 100,
  planets: ['foo', 'bar'],
  tools: [0, 1, 2],
  avg_luck: 30,
  rarities: ['rare'],
};

describe('MineLuck Unit tests', () => {
  it('"MineLuck.fromDto" should create entity based on given data', async () => {
    const entity = MineLuck.fromDto(dto);
    expect(entity.toJson()).toEqual({
      miner: 'foo_id',
      total_luck: 200,
      total_mines: 100,
      planets: ['foo', 'bar'],
      tools: [0, 1, 2],
      avg_luck: 30,
      rarities: ['rare'],
    });
  });
});
