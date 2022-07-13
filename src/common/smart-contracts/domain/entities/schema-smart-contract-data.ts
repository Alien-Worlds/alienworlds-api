import {
  SchemaFormat,
  SchemaSmartContractTableRow,
} from '@common/smart-contracts/data/smart-contract.dtos';

/**
 * Represents schema smart contract data
 *
 * @class
 */
export class SchemaSmartContractData {
  /**
   * @private
   * @constructor
   * @param {SchemaFormat} format
   */
  private constructor(public readonly format: SchemaFormat) {}

  /**
   * Get Schema smart contract data based on table row.
   *
   * @static
   * @param {SchemaSmartContractTableRow} dto
   * @returns {SchemaSmartContractData}
   */
  public static fromDto(
    dto: SchemaSmartContractTableRow
  ): SchemaSmartContractData {
    const { format } = dto;
    return new SchemaSmartContractData(format);
  }
}
