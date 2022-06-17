/* eslint-disable @typescript-eslint/no-unused-vars */
export const AbiHexRepositoryImpl = jest.fn(() => {
  let mostRecentAbi;
  return {
    load: jest.fn(),
    getMostRecentAbi: jest.fn(),
  };
});
