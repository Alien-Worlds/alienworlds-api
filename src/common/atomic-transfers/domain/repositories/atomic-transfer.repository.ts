import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { AtomicTransfer } from '../entities/atomic-transfer';

/**
 * @class
 * @abstract
 */
@injectable()
export abstract class AtomicTransferRepository {
  public static Token = 'ATOMIC_TRANSFER_REPOSITORY';

  public abstract add(entity: AtomicTransfer): Promise<Result<AtomicTransfer>>;
  public abstract getByAssetId(
    assetId: bigint
  ): Promise<Result<AtomicTransfer>>;
}
