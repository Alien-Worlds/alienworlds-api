/* eslint-disable @typescript-eslint/no-explicit-any */

export const EosRpcSource = jest.fn(() => ({
  getTableRows: () => ({
    findOne: jest.fn(),
  }),
}));

(EosRpcSource as any).Token = 'EOS_RPC_SOURCE';
