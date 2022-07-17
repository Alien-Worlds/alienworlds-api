import {
  parseToBigInt,
  removeUndefinedProperties,
} from '@common/utils/dto.utils';
import { MineDocument, MineMessageData } from '../../data/mines.dtos';
import { MineParamsData } from '@common/mines/data/mines.dtos';
import { Long } from 'mongodb';
import { ActionProcessingJob } from '@common/data-processing-queue/domain/entities/action-processing.job';

/**
 * Mine params entity.
 *
 * @class
 */
export class MineParams {
  private constructor(
    public readonly invalid: number,
    public readonly error: string,
    public readonly delay: number,
    public readonly difficulty: number,
    public readonly ease: number,
    public readonly luck: number,
    public readonly commission: number
  ) {}

  /**
   * Get DTO from the entity
   *
   * @returns {MineParamsData}
   */
  public toDto(): MineParamsData {
    const dto: MineParamsData = {
      invalid: this.invalid,
      error: this.error,
      delay: this.delay,
      difficulty: this.difficulty,
      ease: this.ease,
      luck: this.luck,
      commission: this.commission,
    };

    // Remove undefined properties so as not to send them to the data source.
    // This should not happen - the only exception is the "_id" property
    // which may be undefined if the entity was created on the basis of
    // DTO without given id, e.g. from the message.

    return removeUndefinedProperties<MineParamsData>(dto);
  }

  /**
   * Create MineParams instance based on
   * the deserialized params data.
   *
   * @static
   * @param {MineParamsData} dto
   * @returns {MineParams}
   */
  public static fromDto(dto: MineParamsData): MineParams {
    const { invalid, error, delay, difficulty, ease, luck, commission } =
      dto || {};

    return new MineParams(
      invalid,
      error,
      delay,
      difficulty,
      ease,
      luck,
      commission
    );
  }
}

/**
 * The class representing mine entity.
 *
 * @class
 */
export class Mine {
  private constructor(
    public readonly id: string,
    public readonly miner: string,
    public readonly params: MineParams,
    public readonly bounty: number,
    public readonly landId: string,
    public readonly planetName: string,
    public readonly landowner: string,
    public readonly bagItems: bigint[],
    public readonly offset: number,
    public readonly blockNumber: bigint,
    public readonly blockTimestamp: Date,
    public readonly globalSequence: bigint,
    public readonly transactionId: string
  ) {}

  /**
   * Get DTO from the entity
   *
   * @returns {MineDocument}
   */
  public toDto(): MineDocument {
    const {
      id,
      miner,
      params,
      bounty,
      landId,
      planetName,
      landowner,
      bagItems,
      offset,
      blockNumber,
      blockTimestamp,
      globalSequence,
      transactionId,
    } = this;
    const dto: MineDocument = {
      miner,
      params: params.toDto(),
      bounty,
      land_id: landId,
      planet_name: planetName,
      landowner,
      bag_items: bagItems.map(item => Long.fromBigInt(item)),
      offset,
      block_num: Long.fromBigInt(blockNumber),
      block_timestamp: blockTimestamp,
      global_sequence: Long.fromBigInt(globalSequence),
      tx_id: transactionId,
    };

    if (id) {
      dto._id = id;
    }

    // Remove undefined properties so as not to send them to the data source.
    // This should not happen - the only exception is the "_id" property
    // which may be undefined if the entity was created on the basis of
    // DTO without given id, e.g. from the message.

    return removeUndefinedProperties<MineDocument>(dto);
  }

  /**
   * Creates Mine instance based on the given MineDocument.
   *
   * @static
   * @param {MineDocument} dto
   * @returns {Mine} instance of Mine
   */
  public static fromDto(dto: MineDocument): Mine {
    const {
      _id,
      miner,
      params,
      bounty,
      land_id,
      planet_name,
      landowner,
      bag_items,
      offset,
      block_num,
      block_timestamp,
      global_sequence,
      tx_id,
    } = dto;

    const bagItems = Array.isArray(bag_items)
      ? bag_items.map(item => parseToBigInt(item))
      : [];

    return new Mine(
      _id,
      miner,
      MineParams.fromDto(params),
      bounty,
      land_id,
      planet_name,
      landowner,
      bagItems,
      offset,
      parseToBigInt(block_num),
      block_timestamp,
      parseToBigInt(global_sequence),
      tx_id
    );
  }
  /**
   *
   * @param message
   * @param deserializedData
   * @returns
   */
  public static fromMessage(
    message: ActionProcessingJob,
    deserializedData: MineMessageData
  ): Mine {
    const { transactionId, blockNumber, blockTimestamp, globalSequence } =
      message;
    const {
      miner,
      params,
      bounty,
      land_id,
      planet_name,
      landowner,
      bag_items,
      offset,
    } = deserializedData;

    return new Mine(
      '',
      miner,
      MineParams.fromDto(params),
      parseInt(bounty.split(' ')[0].replace('.', '')),
      land_id,
      planet_name,
      landowner,
      bag_items.map(item => parseToBigInt(item)),
      offset,
      blockNumber,
      blockTimestamp,
      globalSequence,
      transactionId
    );
  }
}
