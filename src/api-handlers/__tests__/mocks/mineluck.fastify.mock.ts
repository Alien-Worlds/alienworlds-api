/* eslint-disable @typescript-eslint/no-unused-vars */

import { MineLuckDocument } from '../../mineluck';

/* eslint-disable no-unused-labels */
export const getMineLuckFastifyMock = (options: {
  aggregateResult: MineLuckDocument[];
}) => ({
  mongo: {
    db: {
      collection: (name: string) => ({
        aggregate: (pipeline: unknown) => options.aggregateResult,
      }),
    },
  },
});
