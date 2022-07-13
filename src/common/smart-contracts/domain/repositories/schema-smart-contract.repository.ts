import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { SchemaSmartContractData } from '../entities/schema-smart-contract-data';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class SchemaSmartContractRepository {
  public static Token = 'SCHEMA_SMART_CONTRACT_REPOSITORY';
  /**
   * Get schema data from smart contract table row.
   *
   * @abstract
   * @async
   * @param {string} schema
   * @param {string} collection
   * @returns {Promise<Result<SchemaSmartContractData>>}
   */
  public abstract getData(
    schema: string,
    collection: string
  ): Promise<Result<SchemaSmartContractData>>;
}
