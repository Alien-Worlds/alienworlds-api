/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Long } from 'mongodb';
import { MineParams, Mine } from '../mine';

describe('MineParams Unit tests', () => {
  it('Should create entity based on dto', () => {
    const dto = {
      invalid: 0,
      error: 'error',
      delay: 0,
      difficulty: 1,
      ease: 1,
      luck: 1,
      commission: 1,
    };
    const entity = MineParams.fromDto(dto);

    expect(entity).toEqual({
      invalid: 0,
      error: 'error',
      delay: 0,
      difficulty: 1,
      ease: 1,
      luck: 1,
      commission: 1,
    });
  });

  it('Should create dto based on entity', () => {
    const dto = {
      invalid: 0,
      error: 'error',
      delay: 0,
      difficulty: 1,
      ease: 1,
      luck: 1,
      commission: 1,
    };
    const entity = MineParams.fromDto(dto);
    expect(entity.toDto()).toEqual(dto);
  });
});

describe('Mine Unit tests', () => {
  const paramsDto = {
    invalid: 0,
    error: 'error',
    delay: 0,
    difficulty: 1,
    ease: 1,
    luck: 1,
    commission: 1,
  } as any;
  const dto = {
    _id: 'fake.id',
    miner: 'fake.miner',
    params: paramsDto,
    bounty: 0,
    land_id: 'fake.land_id',
    planet_name: 'fake.planet',
    landowner: 'fake.landowner',
    bag_items: [Long.fromBigInt(0n)],
    offset: 0,
    block_num: Long.fromBigInt(0n),
    block_timestamp: new Date(1642706981000),
    global_sequence: Long.fromBigInt(0n),
    tx_id: '92f0f074f841cafba129c28f65e551f022f7a2b5ba2fdc3463291fc7aee29ce1',
  } as any;

  it('Should create entity based on dto', () => {
    const entity = Mine.fromDto(dto);

    expect(entity).toEqual({
      id: 'fake.id',
      miner: 'fake.miner',
      params: MineParams.fromDto(paramsDto),
      bounty: 0,
      landId: 'fake.land_id',
      planetName: 'fake.planet',
      landowner: 'fake.landowner',
      bagItems: [0n],
      offset: 0,
      blockNumber: 0n,
      blockTimestamp: new Date(1642706981000),
      globalSequence: 0n,
      transactionId:
        '92f0f074f841cafba129c28f65e551f022f7a2b5ba2fdc3463291fc7aee29ce1',
    });
  });

  it('Should dto based on entity', () => {
    const entity = Mine.fromDto(dto);

    expect(entity.toDto()).toEqual(dto);
  });
});
