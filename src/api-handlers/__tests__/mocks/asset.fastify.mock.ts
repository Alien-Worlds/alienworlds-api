import { AssetDocument } from '../../asset';

export const getAssetsFastifyMock = (options: { findResult: AssetDocument[] }) => {
  const { findResult } = options;
  const assets = [...findResult];

  return {
    mongo: {
      db: {
        collection: (name: string) => ({
          find: (query: { id?: string; owner?: string }, rest?: { skip?: number }) => {
            if (query?.id) {
              return {
                count: async () => assets.length,
              };
            }

            const skip = rest?.skip || 0;

            return {
              limit: (value: number) => assets.slice(skip, skip + value),
            };
          },
        }),
      },
    },
  };
};
