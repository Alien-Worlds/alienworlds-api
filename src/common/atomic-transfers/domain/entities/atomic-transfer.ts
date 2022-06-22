import {
  parseToBigInt,
  removeUndefinedProperties,
} from '@common/utils/dto.utils';
import {
  AtomicTransferDocument,
  AtomicTransferMessageData,
} from '@common/atomic-transfers/data/atomic-transfers.dtos';
import { Long } from 'mongodb';
import { ActionProcessingJob } from '@common/data-processing-queue/domain/entities/action-processing.job';
import { ActionType } from '../atomic-transfers.enums';

/**
 * @class
 */
export class AtomicTransfer {
  /**
   * @private
   * @constructor
   * @param {string} id
   * @param {string} type
   * @param {bigint[]} assetIds
   * @param {string} from
   * @param {string} to
   * @param {bigint} blockNumber
   * @param {bigint} globalSequence
   * @param {Date} blockTimestamp
   */
  private constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly assetIds: bigint[],
    public readonly from: string,
    public readonly to: string,
    public readonly blockNumber: bigint,
    public readonly globalSequence: bigint,
    public readonly blockTimestamp: Date
  ) {}

  /**
   * Create AtomicTransfer dto based on current data
   *
   * @returns {AtomicTransferDocument}
   */
  public toDto(): AtomicTransferDocument {
    const {
      id,
      blockNumber,
      type,
      from,
      to,
      assetIds,
      blockTimestamp,
      globalSequence,
    } = this;
    const dto: AtomicTransferDocument = {
      type,
      from,
      to,
      asset_ids: assetIds.map(id => Long.fromBigInt(id)),
      block_num: Long.fromBigInt(blockNumber),
      block_timestamp: blockTimestamp,
      global_sequence: Long.fromBigInt(globalSequence),
    };

    if (id) {
      dto._id = id;
    }

    // Remove undefined properties so as not to send them to the data source.
    // This should not happen - the only exception is the "_id" property
    // which may be undefined if the entity was created on the basis of
    // DTO without given id, e.g. from the message.

    return removeUndefinedProperties<AtomicTransferDocument>(dto);
  }

  /**
   * Create AtomicTransfer instance from given DTO
   *
   * @static
   * @param {AtomicTransferDocument} dto
   * @returns {AtomicTransfer}
   */
  public static fromDto(dto: AtomicTransferDocument): AtomicTransfer {
    const {
      _id,
      type,
      asset_ids,
      from,
      to,
      block_num,
      global_sequence,
      block_timestamp,
    } = dto;

    const assetIds = Array.isArray(asset_ids)
      ? asset_ids.map(item => parseToBigInt(item))
      : [];
    const blockNum =
      block_num instanceof Long ? parseToBigInt(block_num) : block_num;
    const globalSequence =
      global_sequence instanceof Long
        ? parseToBigInt(global_sequence)
        : global_sequence;

    return new AtomicTransfer(
      _id,
      type,
      assetIds,
      from,
      to,
      blockNum,
      globalSequence,
      block_timestamp
    );
  }

  /**
   * Create AtomicTransfer instance from given
   * message and desentralized data.
   *
   * @static
   * @param {ActionProcessingJob} action
   * @param {AtomicTransferMessageData} data
   * @returns {AtomicTransfer}
   */
  public static fromMessage(
    message: ActionProcessingJob,
    data: AtomicTransferMessageData
  ): AtomicTransfer {
    const { blockNumber, blockTimestamp, globalSequence } = message;

    const type = message.name.replace('log', '');
    let from: string;
    let to: string;
    let assetIds: bigint[] = [];

    switch (type) {
      case ActionType.Transfer:
        from = data.from;
        to = data.to;
        assetIds = data.asset_ids.map(id => BigInt(id));
        break;
      case ActionType.Mint:
        from = null;
        to = data.new_asset_owner;
        assetIds = [BigInt(data.asset_id)];
        break;
      case ActionType.Burn:
        from = data.asset_owner;
        to = null;
        assetIds = [BigInt(data.asset_id)];
        break;
    }

    return new AtomicTransfer(
      '',
      type,
      assetIds,
      from,
      to,
      blockNumber,
      globalSequence,
      blockTimestamp
    );
  }
}
