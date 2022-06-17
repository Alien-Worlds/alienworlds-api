/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Long } from 'mongodb';
import { AtomicTransfer } from '../atomic-transfer';

const message = {
  name: 'logtransfer',
  blockNumber: 0n,
  blockTimestamp: new Date(1642706981000),
  globalSequence: 0n,
} as any;

const messageData = {
  _id: '',
  type: 'transfer',
  asset_ids: ['0'],
  from: 'foo.from',
  to: 'bar.to',
  new_asset_owner: 'foo.new.owner',
  asset_owner: 'foo.owner',
  asset_id: '0',
} as any;

const dto = {
  _id: '',
  type: 'foo.type',
  asset_ids: [Long.fromBigInt(0n)],
  from: 'foo.from',
  to: 'bar.to',
  block_num: Long.fromBigInt(0n),
  global_sequence: Long.fromBigInt(0n),
  block_timestamp: new Date(1642706981000),
} as any;

describe('AtomicTransfer Unit tests', () => {
  it('Should create entity based on DTO', () => {
    const entity = AtomicTransfer.fromDto(dto);
    expect(entity).toEqual({
      id: '',
      type: 'foo.type',
      assetIds: [0n],
      from: 'foo.from',
      to: 'bar.to',
      blockNumber: 0n,
      globalSequence: 0n,
      blockTimestamp: new Date(1642706981000),
    });
  });

  it('Should create dto based on entity', () => {
    const entity = AtomicTransfer.fromDto(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it('Should create entity based on message when mesaage name is logtransfer', () => {
    message.name = 'logtransfer';
    const entity = AtomicTransfer.fromMessage(message, messageData);
    expect(entity).toEqual({
      id: '',
      type: 'transfer',
      assetIds: [0n],
      from: 'foo.from',
      to: 'bar.to',
      blockNumber: 0n,
      globalSequence: 0n,
      blockTimestamp: new Date(1642706981000),
    });
  });

  it('Should create entity based on message when mesaage name is logmint', () => {
    message.name = 'logmint';
    const entity = AtomicTransfer.fromMessage(message, messageData);
    expect(entity).toEqual({
      id: '',
      type: 'mint',
      assetIds: [0n],
      from: null,
      to: messageData.new_asset_owner,
      blockNumber: 0n,
      globalSequence: 0n,
      blockTimestamp: new Date(1642706981000),
    });
  });

  it('Should create entity based on message when mesaage name is logburn', () => {
    message.name = 'logburn';
    const entity = AtomicTransfer.fromMessage(message, messageData);
    expect(entity).toEqual({
      id: '',
      type: 'burn',
      assetIds: [0n],
      from: messageData.asset_owner,
      to: null,
      blockNumber: 0n,
      globalSequence: 0n,
      blockTimestamp: new Date(1642706981000),
    });
  });
});
