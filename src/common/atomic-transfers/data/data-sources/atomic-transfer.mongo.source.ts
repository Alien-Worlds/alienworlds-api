import { AtomicTransferDocument } from '../atomic-transfers.dtos';
import { CollectionMongoSource } from '@core/storage/data-sources/collection.mongo.source';
import { Long } from 'mongodb';
import { MongoSource } from '@core/storage/data-sources/mongo.source';

/**
 * AtomicTransfer MongoDB data source
 * @class
 */
export class AtomicTransferMongoSource extends CollectionMongoSource<AtomicTransferDocument> {
  public static Token = 'ATOMIC_TRANSFER_MONGO_SOURCE';
  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(protected mongoSource: MongoSource) {
    super(mongoSource, 'atomictransfers');
  }
  /**
   * Find document by assetId
   *
   * @param {bigint} assetId
   * @returns {AtomicTransferDocument}
   */
  public findByAssetId(assetId: bigint): Promise<AtomicTransferDocument> {
    return this.findOne({
      asset_ids: Long.fromBigInt(assetId),
    });
  }
}
