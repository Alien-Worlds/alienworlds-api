/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MineLuck } from '../../entities/mine-luck';
import { GetMineLuckOutput } from '../get-mine-luck.output';

const dto = {
  _id: 'foo_id',
  total_luck: 200,
  total_mines: 100,
  planets: ['foo', 'bar'],
  tools: [0, 1, 2],
  avg_luck: 30,
  rarities: ['rare'],
};

describe('GetMineLuckOutput Unit tests', () => {
  it('"GetMineLuckOutput.fromEntities" should create output based on entities', async () => {
    const output = GetMineLuckOutput.fromEntities([MineLuck.fromDto(dto)]);
    expect(output).toEqual({
      results: [MineLuck.fromDto(dto).toJson()],
      count: 1,
    });
  });
});
