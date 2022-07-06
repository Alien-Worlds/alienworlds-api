import { AbiHexFile } from '../../data/abi-hex.dto';
import { AbiHex } from './abi-hex';

/**
 * MostRecentAbiHex entity
 * @class
 */
export class MostRecentAbiHex {
  /**
   * @private
   * @constructor
   * @param {AbiHex} data
   * @param {boolean} hasChanged
   */
  private constructor(
    public readonly data: AbiHex,
    public readonly hasChanged: boolean
  ) {}

  /**
   * Parse MostRecentAbiHex entity to Json object
   * @returns {AbiHexFile}
   */
  public toJson(): object {
    return {
      data: this.data.toJson(),
      hasChanged: this.hasChanged,
    };
  }

  /**
   * Create MostRecentAbiHex entity based on provided DTO
   *
   * @static
   * @param {AbiHexFile | AbiHex} data
   * @param {boolean} hasChanged
   * @returns {MostRecentAbiHex}
   */
  public static create(
    data: AbiHexFile | AbiHex,
    hasChanged: boolean
  ): MostRecentAbiHex {
    return new MostRecentAbiHex(
      data instanceof AbiHex ? data : AbiHex.fromDto(data),
      hasChanged
    );
  }
}
