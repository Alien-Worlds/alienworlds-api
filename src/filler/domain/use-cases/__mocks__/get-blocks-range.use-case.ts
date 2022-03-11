/* eslint-disable @typescript-eslint/no-explicit-any */

export const GetBlocksRangeUseCase = jest.fn(() => ({
  execute: jest.fn(),
}));

(GetBlocksRangeUseCase as any).Token = 'GET_BLOCKS_RANGE_USE_CASE';
