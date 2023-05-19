/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Result } from '@alien-worlds/api-core';
import { MineLuck } from '../../entities/mine-luck';
import { ListMineLuckOutput } from '../list-mine-luck.output';

const dto = {
  _id: 'foo_id',
  total_luck: 200,
  total_mines: 100,
  planets: ['foo', 'bar'],
  tools: [0, 1, 2],
  avg_luck: 30,
  rarities: ['rare'],
};

describe('ListMineLuckOutput Unit tests', () => {
  it('"ListMineLuckOutput.fromEntities" should create output based on entities', async () => {
    const output = ListMineLuckOutput.create(
      Result.withContent([MineLuck.fromDto(dto)])
    );
    expect(output.toResponse()).toEqual({
      body: {
        results: [MineLuck.fromDto(dto).toJson()],
        count: 1,
      },
      status: 200,
    });
  });

  it('"toJson" should create an object based on the data of the entity', async () => {
    const output = ListMineLuckOutput.create(
      Result.withContent([MineLuck.fromDto(dto)])
    );
    expect(output.toResponse()).toEqual({
      body: {
        results: [MineLuck.fromDto(dto).toJson()],
        count: 1,
      },
      status: 200,
    });
  });
});
