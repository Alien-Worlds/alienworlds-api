/* eslint-disable @typescript-eslint/no-explicit-any */

export const EosDacService = jest.fn(() => ({
  getInfo: jest.fn(),
  getCurrencyStats: jest.fn(),
  getCurrencyBalance: jest.fn(),
}));

(EosDacService as any).Token = 'EOS_DAC_SERVICE';
