/* eslint-disable @typescript-eslint/no-unused-vars */
export const AbiRepositoryImpl = jest.fn(() => {
  let mostRecentAbi;
  return {
    load: jest.fn(),
    getMostRecentAbi: jest.fn(),
  };
});
