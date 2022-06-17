import { AssetDocument } from '../assets.dtos';
import { CollectionMongoSource } from '@core/storage/data-sources/collection.mongo.source';
import { Long } from 'mongodb';
import { MongoSource } from '@core/storage/data-sources/mongo.source';

/**
 * Asset MongoDB data source
 * @class
 */
export class AssetMongoSource extends CollectionMongoSource<AssetDocument> {
  public static Token = 'ASSET_MONGO_SOURCE';

  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(mongoSource: MongoSource) {
    super(mongoSource, 'assets');
  }

  /**
   * Find document by assetId
   *
   * @param {bigint} assetId
   * @returns {AtomicTransferDocument}
   */
  public findByAssetId(assetId: bigint): Promise<AssetDocument> {
    return this.findOne({
      asset_ids: Long.fromBigInt(assetId),
    });
  }
}
