/* eslint-disable @typescript-eslint/no-explicit-any */

export const MongoSource = jest.fn(() => ({
  database: {
    collection: () => ({
      findOne: jest.fn(),
    }),
  },
}));

(MongoSource as any).Token = 'MONGO_SOURCE';
