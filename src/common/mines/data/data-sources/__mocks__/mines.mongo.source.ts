/* eslint-disable @typescript-eslint/no-explicit-any */

export const MinesMongoSource = jest.fn(() => ({
  findLastBlock: jest.fn(),
}));

(MinesMongoSource as any).Token = 'MINES_MONGO_SOURCE';
