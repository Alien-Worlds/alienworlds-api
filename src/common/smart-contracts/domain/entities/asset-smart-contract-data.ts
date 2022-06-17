import { AssetSmartContractTableRow } from '@common/smart-contracts/data/smart-contract.dtos';

/**
 * Represents asset smart contract data
 *
 * @class
 */
export class AssetSmartContractData {
  /**
   * @private
   * @constructor
   * @param {string} collectionName
   * @param {string} schemaName
   * @param {number} templateId
   */
  private constructor(
    public readonly collectionName: string,
    public readonly schemaName: string,
    public readonly templateId: number
  ) {}

  /**
   * Get Asset smart contract data based on table row.
   *
   * @static
   * @param {AssetSmartContractTableRow} dto
   * @returns {AssetSmartContractData}
   */
  public static fromDto(
    dto: AssetSmartContractTableRow
  ): AssetSmartContractData {
    const { collection_name, schema_name, template_id } = dto;
    return new AssetSmartContractData(
      collection_name,
      schema_name,
      parseInt(template_id)
    );
  }
}
