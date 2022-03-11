/* eslint-disable @typescript-eslint/no-explicit-any */

export const PopulateBlockRangesUseCase = jest.fn(() => ({
  execute: jest.fn(),
}));

(PopulateBlockRangesUseCase as any).Token = 'POPULATE_BLOCK_RANGES_USE_CASE';
