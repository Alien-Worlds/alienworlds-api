import { parseToBigInt } from '@common/utils/dto.utils';
import { AbiHexFile } from '../../data/abi-hex.dto';

/**
 * ABI hex entity
 * @class
 */
export class AbiHex {
  /**
   * @private
   * @constructor
   * @param {string} contract
   * @param {bigint} blockNumber
   * @param {string} hex
   * @param {string} filename
   */
  private constructor(
    public readonly contract: string,
    public readonly blockNumber: bigint,
    public readonly hex: string,
    public readonly filename: string
  ) {}

  /**
   * Parse ABI entity to DTO
   * @returns {AbiHexFile}
   */
  public toDto(): AbiHexFile {
    return {
      contract: this.contract,
      block_num: this.blockNumber.toString(),
      hex: this.hex,
      filename: this.filename,
    };
  }

  /**
   * Parse ABI entity to Json object
   * @returns {AbiHexFile}
   */
  public toJson(): object {
    return {
      contract: this.contract,
      blockNumber: this.blockNumber.toString(),
      hex: this.hex,
      filename: this.filename,
    };
  }

  /**
   * Create ABI entity based on provided DTO
   *
   * @static
   * @param {AbiHexFile} dto
   * @returns {AbiHex}
   */
  public static fromDto(dto: AbiHexFile): AbiHex {
    const { contract, block_num, hex, filename } = dto;
    return new AbiHex(contract, parseToBigInt(block_num), hex, filename);
  }
}
