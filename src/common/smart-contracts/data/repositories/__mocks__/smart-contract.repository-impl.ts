/* eslint-disable @typescript-eslint/no-unused-vars */

export const SmartContractRepositoryImpl = jest.fn(() => {
  return {
    getData: jest.fn(),
    store: jest.fn(),
    getOneRowBy: jest.fn(),
  };
});
