import { AtomicTransfer } from '@common/atomic-transfers/domain/entities/atomic-transfer';
import { AtomicTransferRepository } from '@common/atomic-transfers/domain/repositories/atomic-transfer.repository';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { AtomicTransferMongoSource } from '../data-sources/atomic-transfer.mongo.source';

/**
 * @class
 */
export class AtomicTransferRepositoryImpl implements AtomicTransferRepository {
  /**
   * @constructor
   * @param {AtomicTransferMongoSource} atomicTransferMongoSource
   */
  constructor(private atomicTransferMongoSource: AtomicTransferMongoSource) {}

  /**
   * Get atomic transfer by asset_id
   *
   * @param {bigint} assetId
   * @returns {Promise<Result<AtomicTransfer>>}
   */
  public async getByAssetId(assetId: bigint): Promise<Result<AtomicTransfer>> {
    try {
      const dto = await this.atomicTransferMongoSource.findByAssetId(assetId);
      return Result.withContent(AtomicTransfer.fromDto(dto));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Add atomic transfer to the data source
   *
   * @async
   * @param {AtomicTransfer} entity
   * @returns {Result<AtomicTransfer>}
   */
  public async add(entity: AtomicTransfer): Promise<Result<AtomicTransfer>> {
    try {
      const dto = entity.toDto();
      const id = await this.atomicTransferMongoSource.insert(dto);
      dto._id = id;
      return Result.withContent(AtomicTransfer.fromDto(dto));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Remove atomic transfer from the data source
   *
   * @async
   * @param {AtomicTransfer} entity
   * @returns {Result<boolean>}
   */
  public async remove(entity: AtomicTransfer): Promise<Result<boolean>> {
    try {
      const dto = entity.toDto();
      const isRemoved = await this.atomicTransferMongoSource.remove(dto);
      return Result.withContent(isRemoved);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
