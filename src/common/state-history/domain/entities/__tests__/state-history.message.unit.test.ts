/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { GetBlocksResult } from '../get-blocks.result';
import { StateHistoryMessage } from '../state-history.message';
import { deserializeMessage } from '../../state-history.utils';

jest.mock('eosjs/dist/eosjs-serialize');
jest.mock(
  '../../state-history.utils',
  jest.fn(() => ({
    deserializeMessage: jest.fn(() => ['get_status_result_v0', {}]),
  }))
);

describe('StateHistoryMessage Unit tests', () => {
  it('"create" should create StateHistoryMessage entity based on given DTO', async () => {
    GetBlocksResult.create = jest.fn().mockImplementation();

    const entity = StateHistoryMessage.create(Uint8Array.from([]), new Map());

    expect(entity).toBeInstanceOf(StateHistoryMessage);
    expect(deserializeMessage).toBeCalled();
  });

  it('"isGetStatusResult" should return true when type is "get_status_result_{version}"', async () => {
    GetBlocksResult.create = jest.fn().mockImplementation();

    const entity = StateHistoryMessage.create(Uint8Array.from([]), new Map());

    expect(entity.isGetStatusResult).toBeTruthy();
  });

  it('"isGetBlocksResult" should return true when type is "get_blocks_result_{version}"', async () => {
    GetBlocksResult.create = jest.fn().mockImplementation();

    const entity = StateHistoryMessage.create(Uint8Array.from([]), new Map());
    (entity as any).type = `get_blocks_result_${entity.version}`;

    expect(entity.isGetBlocksResult).toBeTruthy();
  });
});
