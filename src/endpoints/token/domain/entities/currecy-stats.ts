import { CurrencyStatsDto } from '../../data/dtos/eos-dac.dtos';

/**
 * Represents currency stats entity
 * @class
 */
export class CurrencyStats {
  /**
   * @private
   * @constructor
   * @param {string} supply
   * @param {string} maxSupply
   * @param {string} issuer
   */
  private constructor(
    public readonly supply: string,
    public readonly maxSupply: string,
    public readonly issuer: string
  ) {}

  /**
   * Create the CurrencyStats entitty from DTO.
   *
   * @static
   * @param {CurrencyStatsDto} dto
   * @returns {CurrencyStats}
   */
  public static fromDto(dto: CurrencyStatsDto): CurrencyStats {
    const {
      TLM: { supply, max_supply, issuer },
    } = dto;
    return new CurrencyStats(supply, max_supply, issuer);
  }
}
