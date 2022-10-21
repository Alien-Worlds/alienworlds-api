/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MineMapper } from '@alien-worlds/alienworlds-api-common';
import { MineLuck } from '../../../domain/entities/mine-luck';
import { MineLuckRepositoryImpl } from '../mine-luck.repository-impl';

const dto = {
  _id: 'foo_id',
  total_luck: 200,
  total_mines: 100,
  planets: ['foo', 'bar'],
  tools: [0, 1, 2],
  avg_luck: 30,
  rarities: ['rare'],
};

const minesMongoSourceMock = {
  aggregate: jest.fn(() => [dto]),
};

describe('MineLuckRepositoryImpl Unit tests', () => {
  it('Should result with the list of MineLuck entities', async () => {
    const repository = new MineLuckRepositoryImpl(
      minesMongoSourceMock as any,
      new MineMapper()
    );

    const result = await repository.listMineLuck(
      '2021-12-06T10:00:00.000Z',
      '2021-12-06T11:00:00.000Z'
    );

    expect(result.content).toEqual([MineLuck.fromDto(dto)]);
  });

  it('Should result with failure when data source operation fails', async () => {
    minesMongoSourceMock.aggregate.mockImplementation(() => {
      throw new Error('something went wrong');
    });
    const repository = new MineLuckRepositoryImpl(
      minesMongoSourceMock as any,
      new MineMapper()
    );

    const result = await repository.listMineLuck(
      '2021-12-06T10:00:00.000Z',
      '2021-12-06T11:00:00.000Z'
    );

    expect(result.isFailure).toEqual(true);
  });
});
