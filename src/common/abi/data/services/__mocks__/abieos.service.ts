/* eslint-disable @typescript-eslint/no-explicit-any */

export const AbieosService = jest.fn(() => ({
  loadAbiHex: jest.fn(),
  getTypeForAction: jest.fn(),
  getTypeForTable: jest.fn(),
  parseDataToJson: jest.fn(),
}));

(AbieosService as any).Token = 'ABIEOS_SERVICE';
