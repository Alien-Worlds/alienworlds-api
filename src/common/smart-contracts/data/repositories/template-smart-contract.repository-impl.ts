import { TemplateSmartContractData } from '@common/smart-contracts/domain/entities/template-smart-contract-data';
import { TemplateSmartContractRepository } from '@common/smart-contracts/domain/repositories/template-smart-contract.repository';
import { EosRpcSource } from '@core/rpc/data/data-sources/eos-rpc.source';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { TemplateSmartContractTableRow } from '../smart-contract.dtos';
import { SmartContractRepositoryImpl } from './smart-contract.repository-impl';

/**
 * Represents a repository of templates retrieved from the blockchain.
 *
 * @class
 */
export class TemplateSmartContractRepositoryImpl
  extends SmartContractRepositoryImpl<
    TemplateSmartContractData,
    TemplateSmartContractTableRow
  >
  implements TemplateSmartContractRepository
{
  /**
   * @constructor
   * @param {EosRpcSource} source
   */
  constructor(source: EosRpcSource) {
    super(source, 'templates');
  }

  /**
   * Get smart contract data by bound and scope.
   *
   * @async
   * @param {string} bound
   * @param {string} scope
   * @param {boolean} shouldStore - determines whether the received entity should be added to the storage
   * @returns {Promise<Result<EntityType>>}
   */
  public async getData(
    templateId: string,
    collection: string
  ): Promise<Result<TemplateSmartContractData>> {
    const key = `${templateId}::${collection}`;
    // first look for the cached entity
    const entity = this.storage.get(key);

    if (entity) {
      return Result.withContent(entity);
    }

    try {
      const dto = await this.getOneRowBy(templateId, collection);
      const entity = TemplateSmartContractData.fromDto(dto);
      // add created entity to the storage for later use
      this.store(key, entity);

      return Result.withContent(entity);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
