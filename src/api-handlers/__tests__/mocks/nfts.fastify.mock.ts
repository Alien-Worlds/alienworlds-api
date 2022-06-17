/* eslint-disable @typescript-eslint/no-unused-vars */
import { NftDocument } from '../../nfts';

export const getNFTsFastifyMock = (options: {
  findResult?: NftDocument[];
  countResult?: number;
}) => {
  const { findResult, countResult } = options;
  const nfts = findResult ? [...findResult] : [];

  return {
    mongo: {
      db: {
        collection: (name: string) => ({
          find: (query: unknown, rest?: unknown) => ({
            sort: (...args: unknown[]) => {
              return {
                limit: (value: number) => nfts.slice(0, value),
              };
            },
            count: () => countResult || 0,
          }),
        }),
      },
    },
  };
};
