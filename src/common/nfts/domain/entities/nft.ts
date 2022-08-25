import {
  parseToBigInt,
  removeUndefinedProperties,
} from '@common/utils/dto.utils';
import { Long } from 'mongodb';
import { NftDocument } from '../../data/nfts.dtos';
import { NftParams } from './nft-params';
import { NftTemplateData } from './nft-template-data';

/**
 * @class
 */
export class NFT {
  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly id: string,
    public readonly miner: string,
    public readonly landId: string,
    public readonly params: NftParams,
    public readonly rand1: number,
    public readonly rand2: number,
    public readonly rand3: number,
    public readonly templateId: number,
    public readonly blockNumber: bigint,
    public readonly blockTimestamp: Date,
    public readonly globalSequence: bigint,
    public readonly templateData: NftTemplateData
  ) {}

  /**
   * Get DTO from the entity
   *
   * @returns {NftDocument}
   */
  public toDto(): NftDocument {
    const {
      id,
      miner,
      params,
      landId,
      rand1,
      rand2,
      rand3,
      templateId,
      blockNumber,
      blockTimestamp,
      globalSequence,
      templateData,
    } = this;
    const dto: NftDocument = {
      miner,
      params: params.toDto(),
      land_id: landId,
      rand1,
      rand2,
      rand3,
      template_id: templateId,
      block_num: Long.fromBigInt(blockNumber),
      block_timestamp: blockTimestamp,
      global_sequence: Long.fromBigInt(globalSequence),
      template_data: templateData.toDto(),
    };

    if (id) {
      dto._id = id;
    }

    // Remove undefined properties so as not to send them to the data source.
    // This should not happen - the only exception is the "_id" property
    // which may be undefined if the entity was created on the basis of
    // DTO without given id, e.g. from the message.
    return removeUndefinedProperties<NftDocument>(dto);
  }

  /**
   * Creates NFT instance based on given NftDocument.
   *
   * @static
   * @param {NftDocument} dto
   * @returns {NFT} instance of NFT
   */
  public static fromDto(dto: NftDocument): NFT {
    const {
      _id,
      miner,
      land_id,
      params,
      rand1,
      rand2,
      rand3,
      template_id,
      block_num,
      block_timestamp,
      global_sequence,
      template_data,
    } = dto;

    return new NFT(
      _id,
      miner,
      land_id,
      NftParams.fromDto(params || {}),
      rand1,
      rand2,
      rand3,
      template_id,
      parseToBigInt(block_num),
      block_timestamp,
      parseToBigInt(global_sequence),
      NftTemplateData.fromDto(template_data || {})
    );
  }
}
