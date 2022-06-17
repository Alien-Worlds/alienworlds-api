/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NftParams } from '../nft-params';

describe('NftParams Unit tests', () => {
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
    const entity = NftParams.fromDto(dto);

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

  it('Should create empty entity based on empty dto', () => {
    const dto = {};
    const entity = NftParams.fromDto(dto);

    expect(entity).toEqual({});
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
    const entity = NftParams.fromDto(dto);

    expect(entity.toDto()).toEqual({
      invalid: 0,
      error: 'error',
      delay: 0,
      difficulty: 1,
      ease: 1,
      luck: 1,
      commission: 1,
    });
  });
});
