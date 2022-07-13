import { SchemaSmartContractData } from '@common/smart-contracts/domain/entities/schema-smart-contract-data';
import { SchemaSmartContractRepository } from '@common/smart-contracts/domain/repositories/schema-smart-contract.repository';
import { EosRpcSource } from '@core/rpc/data/data-sources/eos-rpc.source';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { SchemaSmartContractTableRow } from '../smart-contract.dtos';
import { SmartContractRepositoryImpl } from './smart-contract.repository-impl';

/**
 * Represents a repository of schemas retrieved from the blockchain.
 *
 * @class
 */
export class SchemaSmartContractRepositoryImpl
  extends SmartContractRepositoryImpl<
    SchemaSmartContractData,
    SchemaSmartContractTableRow
  >
  implements SchemaSmartContractRepository
{
  /**
   * @constructor
   * @param {EosRpcSource} source
   */
  constructor(source: EosRpcSource) {
    super(source, 'schemas');
  }

  /**
   * Get smart contract data by bound and scope.
   *
   * @async
   * @param {string} schema
   * @param {string} collection
   * @returns {Promise<Result<EntityType>>}
   */
  public async getData(
    schema: string,
    collection: string
  ): Promise<Result<SchemaSmartContractData>> {
    const key = `${schema}::${collection}`;
    // first look for the cached entity
    const entity = this.storage.get(key);

    if (entity) {
      return Result.withContent(entity);
    }

    try {
      const dto = await this.getOneRowBy(schema, collection);
      const entity = SchemaSmartContractData.fromDto(dto);
      // add created entity to the storage for later use
      this.store(key, entity);

      return Result.withContent(entity);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
