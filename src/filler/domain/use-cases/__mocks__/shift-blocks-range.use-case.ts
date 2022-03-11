/* eslint-disable @typescript-eslint/no-explicit-any */

export const ShiftBlocksRangeUseCase = jest.fn(() => ({
  execute: jest.fn(),
}));

(ShiftBlocksRangeUseCase as any).Token = 'SHIFT_BLOCKS_RANGE_USE_CASE';
