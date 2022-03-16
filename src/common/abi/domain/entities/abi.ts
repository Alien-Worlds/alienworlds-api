import { AbiDto } from '../../data/abi.dtos';

/**
 * Abi entity
 * @class
 */
export class Abi {
  /**
   * @private
   * @constructor
   * @param {string} contract
   * @param {number} blockNumber
   * @param {string} abiHex
   * @param {string} filename
   */
  private constructor(
    public readonly contract: string,
    public readonly blockNumber: number,
    public readonly abiHex: string,
    public readonly filename: string
  ) {}

  /**
   * Parse Abi entity to DTO
   * @returns {AbiDto}
   */
  public toDto(): AbiDto {
    return {
      contract: this.contract,
      block_num: this.blockNumber.toString(),
      abi_hex: this.abiHex,
      filename: this.filename,
    };
  }

  /**
   * Create Abi entity based on provided DTO
   *
   * @static
   * @param {AbiDto} dto
   * @returns {Abi}
   */
  public static fromDto(dto: AbiDto): Abi {
    const { contract, block_num, abi_hex, filename } = dto;
    return new Abi(contract, parseInt(block_num), abi_hex, filename);
  }
}
