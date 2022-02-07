import { MineDocument } from '../../mines';

export const getMinesFastifyMock = (options: { findResult: MineDocument[] }) => {
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
