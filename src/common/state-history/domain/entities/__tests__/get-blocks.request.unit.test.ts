/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { serializeMessage } from '../../state-history.utils';
import { GetBlocksRequest } from '../get-blocks.request';

jest.mock('eosjs/dist/eosjs-serialize');
jest.mock('../../state-history.utils');

describe('GetBlocksRequest Unit tests', () => {
  it('"create" should create GetBlocksRequest entity based on given DTO', async () => {
    const entity = GetBlocksRequest.create(
      BlockRange.create(0n, 1n),
      {
        shouldFetchDeltas: true,
        shouldFetchTraces: true,
      },
      new Map()
    );
    expect(entity).toBeInstanceOf(GetBlocksRequest);
  });

  it('"toUint8Array" should call serializeMessage util', async () => {
    const entity = GetBlocksRequest.create(
      BlockRange.create(0n, 1n),
      {
        shouldFetchDeltas: true,
        shouldFetchTraces: true,
      },
      new Map()
    );
    entity.toUint8Array();
    expect(serializeMessage).toBeCalled();
  });
});
