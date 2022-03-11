/* eslint-disable @typescript-eslint/no-explicit-any */
export const GetLastIrreversableBlockNumUseCase = jest.fn(() => ({
  execute: jest.fn(),
}));

(GetLastIrreversableBlockNumUseCase as any).Token =
  'GET_LAST_IRREVERSABLE_BLOCK_NUMBER_USE_CASE';
