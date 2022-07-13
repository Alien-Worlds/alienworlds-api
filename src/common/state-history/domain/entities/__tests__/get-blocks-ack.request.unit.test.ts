/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { serializeMessage } from '../../state-history.utils';
import { GetBlocksAckRequest } from '../get-blocks-ack.request';

jest.mock('eosjs/dist/eosjs-serialize');
jest.mock('../../state-history.utils');

describe('GetBlocksAckRequest Unit tests', () => {
  it('"create" should create GetBlocksAckRequest entity based on given DTO', async () => {
    const entity = new GetBlocksAckRequest(1, new Map());
    expect(entity).toBeInstanceOf(GetBlocksAckRequest);
  });

  it('"toUint8Array" should call serializeMessage util', async () => {
    const entity = new GetBlocksAckRequest(1, new Map());
    entity.toUint8Array();
    expect(serializeMessage).toBeCalled();
  });
});
