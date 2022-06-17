import { TemplateSmartContractTableRow } from '@common/smart-contracts/data/smart-contract.dtos';

/**
 * Represents template smart contract data
 *
 * @class
 */
export class TemplateSmartContractData {
  /**
   * @private
   * @constructor
   * @param {string} schemaName
   * @param {Uint8Array} immutableSerializedData
   */
  private constructor(
    public readonly schemaName: string,
    public readonly immutableSerializedData: Uint8Array
  ) {}

  /**
   * Get Template smart contract data based on table row.
   *
   * @static
   * @param {TemplateSmartContractTableRow} dto
   * @returns {TemplateSmartContractData}
   */
  public static fromDto(
    dto: TemplateSmartContractTableRow
  ): TemplateSmartContractData {
    const { schema_name, immutable_serialized_data } = dto;
    return new TemplateSmartContractData(
      schema_name,
      immutable_serialized_data
    );
  }
}
