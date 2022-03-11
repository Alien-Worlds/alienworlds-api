/* eslint-disable @typescript-eslint/no-explicit-any */

export const GetLastBlockUseCase = jest.fn(() => ({
  execute: jest.fn(),
}));

(GetLastBlockUseCase as any).Token = 'GET_LAST_BLOCK_USE_CASE';
