/* eslint-disable @typescript-eslint/no-explicit-any */

import { Asset } from '@common/assets/domain/entities/asset';
import { Failure } from '@core/architecture/domain/failure';
import { Long } from 'mongodb';
import { AssetRepositoryImpl } from '../asset.repository-impl';

const assetDataDto = {
  collection_name: 'foo.collection',
  template_id: 123456,
  schema_name: 'foo.schema',
  immutable_serialized_data: {
    cardid: 12,
    name: 'foo',
    img: 'foo.img',
    backimg: 'foo.backimg',
    rarity: 'rare',
    shine: 'stone',
    type: 'any',
    delay: 0,
    difficulty: 1,
    ease: 10,
    luck: 100,
  },
};

const dto = {
  asset_id: Long.fromBigInt(0n),
  owner: 'foo.owner',
  data: assetDataDto,
};

const assetMongoSource = {
  findByAssetId: () => ({}),
  update: () => '',
  insert: () => '',
} as any;

describe('AssetRepositoryImpl unit tests', () => {
  it('"getByAssetId" should return a entity', async () => {
    assetMongoSource.findByAssetId = () => dto;
    const repository = new AssetRepositoryImpl(assetMongoSource);
    const result = await repository.getByAssetId(0n);
    expect(result.content).toEqual(Asset.fromDto(dto));
  });

  it('"getByAssetId" should return a failure when ', async () => {
    assetMongoSource.findByAssetId = () => {
      throw new Error();
    };
    const repository = new AssetRepositoryImpl(assetMongoSource);
    const result = await repository.getByAssetId(0n);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"add" should convert entity to dto and send it to data source', async () => {
    assetMongoSource.insert = () => 'foo';
    const repository = new AssetRepositoryImpl(assetMongoSource);
    const result = await repository.add(Asset.fromDto(dto));
    expect(result.content).toEqual(Asset.fromDto({ _id: 'foo', ...dto }));
  });

  it('"add" should return a failure when inserting new document has failed', async () => {
    assetMongoSource.insert = () => {
      throw new Error();
    };
    const repository = new AssetRepositoryImpl(assetMongoSource);
    const result = await repository.add(Asset.fromDto(dto));
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"update" should convert entity to dto and send it to data source', async () => {
    assetMongoSource.update = () => dto;
    const repository = new AssetRepositoryImpl(assetMongoSource);
    const result = await repository.update(Asset.fromDto(dto));
    expect(result.content).toEqual(Asset.fromDto(dto));
  });

  it('"update" should return a failure when update has failed', async () => {
    assetMongoSource.update = () => {
      throw new Error();
    };
    const repository = new AssetRepositoryImpl(assetMongoSource);
    const result = await repository.update(Asset.fromDto(dto));
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });
});
