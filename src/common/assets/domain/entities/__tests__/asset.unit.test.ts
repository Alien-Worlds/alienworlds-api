/* eslint-disable @typescript-eslint/no-explicit-any */
import { deserialize, ObjectSchema } from 'atomicassets';
import { Long } from 'mongodb';
import { Asset, AssetData } from '../asset';

jest.mock('atomicassets');
const ObjectSchemaMock = ObjectSchema as jest.MockedFunction<
  typeof ObjectSchema
>;
const deserializeMock = deserialize as jest.MockedFunction<typeof deserialize>;

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

const assetDto = {
  asset_id: Long.fromBigInt(0n),
  owner: 'foo.owner',
  data: assetDataDto,
};

const assetSmartContractData = {
  collectionName: 'foo.collection',
  schemaName: 'foo.schema',
  templateId: 123,
} as any;
const templateSmartContractData = {
  schemaName: 'foo.schema',
  immutableSerializedData: Uint8Array.from([]),
} as any;
const schemaSmartContractData = {
  format: {
    name: 'foo.name',
    type: 'foo.type',
  },
} as any;

describe('AssetData unit tests', () => {
  it('AssetData.fromDto should return AssetData object based on data provided in given dto', async () => {
    const assetData = AssetData.fromDto(assetDataDto);
    expect(assetData).toEqual({
      collectionName: 'foo.collection',
      templateId: 123456,
      schemaName: 'foo.schema',
      immutableSerializedData: {
        cardId: 12,
        name: 'foo',
        image: 'foo.img',
        backImage: 'foo.backimg',
        rarity: 'rare',
        shine: 'stone',
        type: 'any',
        delay: 0,
        difficulty: 1,
        ease: 10,
        luck: 100,
      },
    });
  });

  it('AssetData.toDto should return a dto based on entity', async () => {
    const assetData = AssetData.fromDto(assetDataDto);
    expect(assetData.toDto()).toEqual(assetDataDto);
  });

  it('AssetData.fromSmartContractsData should return AssetData object based on data provided smart contracts', async () => {
    ObjectSchemaMock.mockReturnValue({} as any);
    deserializeMock.mockReturnValue(
      assetDataDto.immutable_serialized_data as any
    );
    const assetData = AssetData.fromSmartContractsData(
      assetSmartContractData,
      templateSmartContractData,
      schemaSmartContractData
    );
    expect(assetData).toEqual({
      collectionName: 'foo.collection',
      immutableSerializedData: {
        backImage: 'foo.backimg',
        cardId: 12,
        delay: 0,
        difficulty: 1,
        ease: 10,
        image: 'foo.img',
        luck: 100,
        name: 'foo',
        rarity: 'rare',
        shine: 'stone',
        type: 'any',
      },
      schemaName: 'foo.schema',
      templateId: 123,
    });
  });
});

describe('Asset unit tests', () => {
  it('Asset.fromDto should return Asset object based on data provided in given AssetDocument dto', async () => {
    const asset = Asset.fromDto(assetDto);
    expect(asset).toEqual({
      assetId: 0n,
      owner: 'foo.owner',
      data: AssetData.fromDto(assetDataDto),
    });
  });

  it('Asset.create should return Asset object based on provided data', async () => {
    const assetData = AssetData.fromDto(assetDataDto);
    const asset = Asset.create(0n, 'foo.owner', assetData);
    expect(asset).toEqual({
      assetId: 0n,
      owner: 'foo.owner',
      data: assetData,
    });
  });

  it('Asset.toDto should return a dto based on entity', async () => {
    const asset = Asset.fromDto(assetDto);
    expect(asset.toDto()).toEqual(assetDto);
  });
});
