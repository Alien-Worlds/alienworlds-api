import { AssetDocument } from '@common/assets/data/assets.dtos';
import {
  parseToBigInt,
  removeUndefinedProperties,
} from '@common/utils/dto.utils';
import { AssetDataSubDocument } from '@common/assets/data/assets.dtos';
import { AssetSmartContractData } from '@common/smart-contracts/domain/entities/asset-smart-contract-data';
import { SchemaSmartContractData } from '@common/smart-contracts/domain/entities/schema-smart-contract-data';
import { TemplateSmartContractData } from '@common/smart-contracts/domain/entities/template-smart-contract-data';
import { deserialize, ObjectSchema } from 'atomicassets';
import { ImmutableSerializedData } from './immutable-serialized-data';
import { Long } from 'mongodb';

/**
 * Represents asset data entity.
 * @class
 */
export class AssetData {
  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly collectionName: string,
    public readonly schemaName: string,
    public readonly templateId: number,
    public readonly immutableSerializedData: ImmutableSerializedData
  ) {}
  /**
   * Create DTO based on entity data
   *
   * @returns {AssetDataSubDocument}
   */
  public toDto(): AssetDataSubDocument {
    const dto = {
      immutable_serialized_data: this.immutableSerializedData.toDto(),
      collection_name: this.collectionName,
      template_id: this.templateId,
      schema_name: this.schemaName,
    };

    // Remove undefined properties so as not to send them to the data source.
    // This should not happen - the only exception is the "_id" property
    // which may be undefined if the entity was created on the basis of
    // DTO without given id, e.g. from the message.

    return removeUndefinedProperties<AssetDataSubDocument>(dto);
  }

  /**
   * Creates instances of the class Asset data based on given DTO.
   *
   * @static
   * @public
   * @param {AssetDataSubDocument} dto
   * @returns {Asset} instance of Asset
   */
  public static fromDto(dto: AssetDataSubDocument): AssetData {
    const {
      immutable_serialized_data,
      collection_name,
      schema_name,
      template_id,
    } = dto;

    return new AssetData(
      collection_name,
      schema_name,
      template_id,
      ImmutableSerializedData.fromDto(immutable_serialized_data)
    );
  }

  /**
   * Creates Asset class data instances based on data from
   * smart contract tables (assets, templates, schemas).
   *
   * @static
   * @public
   * @param {AssetSmartContractData} asset
   * @param {TemplateSmartContractData} template
   * @param {SchemaSmartContractData} schema
   * @returns {AssetData} instance of Asset
   */
  public static fromSmartContractsData(
    asset: AssetSmartContractData,
    template: TemplateSmartContractData,
    schema: SchemaSmartContractData
  ): AssetData {
    const immutableSerializedData = deserialize(
      template.immutableSerializedData,
      ObjectSchema(schema.format)
    );

    return new AssetData(
      asset.collectionName,
      asset.schemaName,
      asset.templateId,
      ImmutableSerializedData.fromDto(immutableSerializedData)
    );
  }
}

/**
 * Represents asset entity.
 *
 * @class
 */
export class Asset {
  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly id: string,
    public readonly assetId: bigint,
    public readonly owner: string,
    public readonly data: AssetData
  ) {}
  /**
   * Create DTO based on entity data
   *
   * @returns {AssetDocument}
   */
  public toDto(): AssetDocument {
    const { id, assetId, owner, data } = this;
    const dto: AssetDocument = {
      asset_id: Long.fromBigInt(assetId),
      owner: owner,
      data: data.toDto(),
    };

    if (id) {
      dto._id = id;
    }

    // Remove undefined properties so as not to send them to the data source.
    // This should not happen - the only exception is the "_id" property
    // which may be undefined if the entity was created on the basis of
    // DTO without given id, e.g. from the message.

    return removeUndefinedProperties<AssetDocument>(dto);
  }

  /**
   * Create Asset instance based on given data - with optional id.
   *
   * @static
   * @public
   * @param {bigint} assetId
   * @param {string} owner
   * @param {AssetData} data
   * @param {string=} id
   * @returns {Asset} instance of Asset
   */
  public static create(
    assetId: bigint,
    owner: string,
    data: AssetData,
    id?: string
  ): Asset {
    return new Asset(id, assetId, owner, data);
  }

  /**
   * Create Asset instance based on given AssetDocument data.
   *
   * @static
   * @public
   * @param {AssetDocument} dto
   * @returns {Asset} instance of Asset
   */
  public static fromDto(dto: AssetDocument): Asset {
    const { _id, asset_id, owner, data } = dto;
    return new Asset(
      _id,
      parseToBigInt(asset_id),
      owner,
      AssetData.fromDto(data)
    );
  }
}
