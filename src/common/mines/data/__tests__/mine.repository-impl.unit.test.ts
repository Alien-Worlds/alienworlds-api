/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Mine } from '@common/mines/domain/entities/mine';
import { InsertManyError } from '@common/mines/domain/errors/insert-many.error';
import { Failure } from '@core/architecture/domain/failure';
import { DataSourceBulkWriteError } from '@core/architecture/data/errors/data-source-bulk-write.error';
import { MineRepositoryImpl } from '../mine.repository-impl';
import { InsertError } from '@common/mines/domain/errors/insert.error';
import { DataSourceOperationError } from '@core/architecture/data/errors/data-source-operation.error';

const paramsDto = {
  invalid: 0,
  error: 'error',
  delay: 0,
  difficulty: 1,
  ease: 1,
  luck: 1,
  commission: 1,
} as any;
const dto = {
  _id: 'fake.id',
  miner: 'fake.miner',
  params: paramsDto,
  bounty: 0,
  land_id: 'fake.land_id',
  planet_name: 'fake.planet',
  landowner: 'fake.landowner',
  bag_items: [0n],
  offset: 0,
  block_num: 0n,
  block_timestamp: new Date(1642706981000),
  global_sequence: 0n,
  tx_id: '92f0f074f841cafba129c28f65e551f022f7a2b5ba2fdc3463291fc7aee29ce1',
} as any;

const minesMongoSourceMock = {
  findLastBlock: () => ({}),
  insertMany: () => [],
  insert: () => ({}),
};

describe('MineRepositoryImpl Unit tests', () => {
  it('"getLastBlock" should return a entity', async () => {
    minesMongoSourceMock.findLastBlock = () => dto;
    const repository = new MineRepositoryImpl(minesMongoSourceMock as any);
    const result = await repository.getLastBlock();
    expect(result.content).toEqual(Mine.fromDto(dto));
  });

  it('"getLastBlock" should return a failure when getting last block has failed', async () => {
    minesMongoSourceMock.findLastBlock = () => {
      throw new Error();
    };
    const repository = new MineRepositoryImpl(minesMongoSourceMock as any);
    const result = await repository.getLastBlock();
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"insertMany" should insert to the data source multiple documents, created from the entities', async () => {
    minesMongoSourceMock.insertMany = () => [];

    const repository = new MineRepositoryImpl(minesMongoSourceMock as any);
    const entity = Mine.fromDto(dto);
    const list = [entity, entity];
    const result = await repository.insertMany(list);
    expect(result.content).toEqual(list);
    expect(result.failure).toBeUndefined();
  });

  it('"insertMany" should return a failure when isertion has failed', async () => {
    minesMongoSourceMock.insertMany = () => {
      throw DataSourceBulkWriteError.create(new Error('something went wrong'));
    };

    const repository = new MineRepositoryImpl(minesMongoSourceMock as any);
    const entity = Mine.fromDto(dto);
    const list = [entity, entity];
    const result = await repository.insertMany(list);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
    expect(result.failure.error).toBeInstanceOf(InsertManyError);
    expect(result.failure.error.skippedEntities).toEqual(list);
  });

  it('"insertOne" should store Mine entity', async () => {
    minesMongoSourceMock.insert = () => [];

    const repository = new MineRepositoryImpl(minesMongoSourceMock as any);
    const entity = Mine.fromDto(dto);
    const result = await repository.insertOne(entity);
    expect(result.content).toEqual(entity);
    expect(result.failure).toBeUndefined();
  });

  it('"insertOne" should return a failure when isertion has failed', async () => {
    minesMongoSourceMock.insert = () => {
      throw DataSourceOperationError.fromError(
        new Error('something went wrong')
      );
    };

    const repository = new MineRepositoryImpl(minesMongoSourceMock as any);
    const entity = Mine.fromDto(dto);
    const result = await repository.insertOne(entity);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
    expect(result.failure.error).toBeInstanceOf(InsertError);
  });
});
