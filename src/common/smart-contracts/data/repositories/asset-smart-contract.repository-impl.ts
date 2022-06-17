import { AssetSmartContractData } from '@common/smart-contracts/domain/entities/asset-smart-contract-data';
import { AssetSmartContractRepository } from '@common/smart-contracts/domain/repositories/asset-smart-contract.repository';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { EosRpcSource } from '@core/rpc/data/data-sources/eos-rpc.source';
import { AssetSmartContractTableRow } from '../smart-contract.dtos';
import { SmartContractRepositoryImpl } from './smart-contract.repository-impl';

/**
 * Represents a repository of assets retrieved from the blockchain.
 *
 * @class
 */
export class AssetSmartContractRepositoryImpl
  extends SmartContractRepositoryImpl<
    AssetSmartContractData,
    AssetSmartContractTableRow
  >
  implements AssetSmartContractRepository
{
  /**
   * @constructor
   * @param {EosRpcSource} source
   */
  constructor(source: EosRpcSource) {
    super(source, 'assets');
  }
  /**
   * Get smart contract data by bound and scope.
   *
   * @async
   * @param {string} assetId
   * @param {string} owner
   * @returns {Promise<Result<EntityType>>}
   */
  public async getData(
    assetId: string,
    owner: string
  ): Promise<Result<AssetSmartContractData>> {
    try {
      const dto = await this.getOneRowBy(assetId, owner);
      return Result.withContent(AssetSmartContractData.fromDto(dto));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
