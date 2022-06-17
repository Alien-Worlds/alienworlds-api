import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { TemplateSmartContractData } from '../entities/template-smart-contract-data';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class TemplateSmartContractRepository {
  public static Token = 'TEMPLATE_SMART_CONTRACT_REPOSITORY';
  /**
   * Get template data from smart contract table row.
   *
   * @abstract
   * @async
   * @param {string} templateId
   * @param {string} collection
   * @returns {Promise<Result<TemplateSmartContractData>>}
   */
  public abstract getData(
    templateId: string,
    collection: string
  ): Promise<Result<TemplateSmartContractData>>;
}
