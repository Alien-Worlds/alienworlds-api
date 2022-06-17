import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { AssetSmartContractData } from '../entities/asset-smart-contract-data';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class AssetSmartContractRepository {
  public static Token = 'ASSET_SMART_CONTRACT_REPOSITORY';
  /**
   * Get asset data from smart contract table row.
   *
   * @abstract
   * @async
   * @param {string} assetId
   * @param {string} owner
   * @returns {Promise<Result<AssetSmartContractData>>}
   */
  public abstract getData(
    assetId: string,
    owner: string
  ): Promise<Result<AssetSmartContractData>>;
}
