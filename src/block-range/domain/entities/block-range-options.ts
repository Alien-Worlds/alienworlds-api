import { OptionValues } from 'commander';
import { config } from '@config';

/**
 * @class
 */
export class BlockRangeOptions {
  private constructor(public readonly scanKey: string) {}

  /**
   * Create instance of the BlockRangeOptions
   *
   * @static
   * @param {OptionValues} options
   * @returns {BlockRangeOptions}
   */
  public static fromOptionValues(options: OptionValues): BlockRangeOptions {
    const scanKey = options.scanKey || config.blockRangeScan.scanKey;

    return new BlockRangeOptions(scanKey);
  }
}
