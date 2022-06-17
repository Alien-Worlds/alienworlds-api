/* eslint-disable @typescript-eslint/no-explicit-any */

export const MineMongoSource = jest.fn(() => ({
  findLastBlock: jest.fn(),
}));

(MineMongoSource as any).Token = 'MINES_MONGO_SOURCE';
