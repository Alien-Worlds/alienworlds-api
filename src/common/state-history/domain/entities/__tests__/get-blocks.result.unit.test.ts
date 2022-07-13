/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { deserializeMessage } from '../../state-history.utils';
import { Block } from '../block';
import { Delta } from '../delta';
import { GetBlocksResult } from '../get-blocks.result';
import { Trace } from '../trace';

jest.mock('eosjs/dist/eosjs-serialize');
jest.mock(
  '../../state-history.utils',
  jest.fn(() => ({
    deserializeMessage: jest.fn(() => []),
  }))
);

const dto = {
  head: {
    block_num: 1000,
    block_id: '1000',
  },
  this_block: {
    block_num: 1000,
    block_id: '1000',
  },
  last_irreversible: {
    block_num: 1000,
    block_id: '1000',
  },
  prev_block: {
    block_num: 1000,
    block_id: '1000',
  },
  block: Uint8Array.from([]),
  traces: Uint8Array.from([]),
  deltas: Uint8Array.from([]),
};

describe('GetBlocksResult Unit tests', () => {
  it('"create" should create GetBlocksResult entity based on given DTO', async () => {
    const entity = GetBlocksResult.create(dto, new Map());
    expect(entity).toBeInstanceOf(GetBlocksResult);
  });

  it('"create" should call deserializeMessage when result contains block or deltas or traces', async () => {
    dto.block = Uint8Array.from([1, 2, 3, 4]);
    dto.traces = Uint8Array.from([1, 2, 3, 4]);
    dto.deltas = Uint8Array.from([1, 2, 3, 4]);
    Block.create = jest.fn().mockReturnValue({});
    Trace.create = jest.fn().mockImplementation();
    Delta.create = jest.fn().mockImplementation();
    GetBlocksResult.create(dto, new Map());
    expect(deserializeMessage).toBeCalledTimes(3);
  });
});
