/* eslint-disable @typescript-eslint/no-explicit-any */

export const EosDacRepositoryImpl = jest.fn(() => ({
  getInfo: jest.fn(),
  getCurrecyStats: jest.fn(),
  getCurrencyBalance: jest.fn(),
}));
