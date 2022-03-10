/* eslint-disable @typescript-eslint/no-unused-vars */

import { MineDocument } from '@common/mines/data/mines.dtos';

export const getMinesFastifyMock = (options: {
  findResult: MineDocument[];
}) => {
  const { findResult } = options;
  const mines = [...findResult];

  return {
    mongo: {
      db: {
        collection: (name: string) => ({
          find: (query: unknown, rest?: unknown) => ({
            sort: (...args: unknown[]) => {
              return {
                limit: (value: number) => mines.slice(0, value),
              };
            },
          }),
        }),
      },
    },
  };
};
