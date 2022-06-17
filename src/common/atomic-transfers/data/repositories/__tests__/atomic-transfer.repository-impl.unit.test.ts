/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AtomicTransfer } from '@common/atomic-transfers/domain/entities/atomic-transfer';
import { Failure } from '@core/architecture/domain/failure';
import { Long } from 'mongodb';
import { AtomicTransferRepositoryImpl } from '../atomic-transfer.repository-impl';

const dto = {
  type: 'foo.type',
  asset_ids: [Long.fromBigInt(0n)],
  from: 'foo.from',
  to: 'bar.to',
  block_num: Long.fromBigInt(0n),
  global_sequence: Long.fromBigInt(0n),
  block_timestamp: new Date(1642706981000),
} as any;

const atomicTransferMongoSource = {
  findByAssetId: () => ({}),
  insert: () => '',
};

describe('AtomicTransferRepositoryImpl Unit tests', () => {
  it('"getByAssetId" should return a entity', async () => {
    atomicTransferMongoSource.findByAssetId = () => dto;
    const repository = new AtomicTransferRepositoryImpl(
      atomicTransferMongoSource as any
    );
    const result = await repository.getByAssetId(0n);
    expect(result.content).toEqual(AtomicTransfer.fromDto(dto));
  });

  it('"getByAssetId" should return a failure when ', async () => {
    atomicTransferMongoSource.findByAssetId = () => {
      throw new Error();
    };
    const repository = new AtomicTransferRepositoryImpl(
      atomicTransferMongoSource as any
    );
    const result = await repository.getByAssetId(0n);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"add" should convert entity to dto and send it to data source', async () => {
    atomicTransferMongoSource.insert = () => 'foo';
    const repository = new AtomicTransferRepositoryImpl(
      atomicTransferMongoSource as any
    );
    const result = await repository.add(AtomicTransfer.fromDto(dto));
    expect(result.content).toEqual(
      AtomicTransfer.fromDto({ _id: 'foo', ...dto })
    );
  });

  it('"add" should return a failure when inserting new document has failed', async () => {
    atomicTransferMongoSource.insert = () => {
      throw new Error();
    };
    const repository = new AtomicTransferRepositoryImpl(
      atomicTransferMongoSource as any
    );
    const result = await repository.add(AtomicTransfer.fromDto(dto));
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });
});
