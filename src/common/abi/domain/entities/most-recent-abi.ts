import { AbiDto } from '../../data/abi.dtos';
import { Abi } from './abi';

/**
 * MostRecentAbi entity
 * @class
 */
export class MostRecentAbi {
  /**
   * @private
   * @constructor
   * @param {Abi} data
   * @param {boolean} hasChanged
   */
  private constructor(
    public readonly data: Abi,
    public readonly hasChanged: boolean
  ) {}

  /**
   * Create MostRecentAbi entity based on provided DTO
   *
   * @static
   * @param {AbiDto} dto
   * @param {boolean} hasChanged
   * @returns {Abi}
   */
  public static create(dto: AbiDto, hasChanged: boolean): MostRecentAbi {
    return new MostRecentAbi(Abi.fromDto(dto), hasChanged);
  }
}
