import { OptionValues } from 'commander';
import { config } from '@config';
import { parseToBigInt } from '@common/utils/dto.utils';

/**
 * @class
 */
export class FillerOptions {
  private constructor(
    public readonly startBlock: bigint,
    public readonly endBlock: bigint,
    public readonly test: number,
    public readonly replay: boolean
  ) {}

  /**
   * Create instance of the FillerOptions
   *
   * @static
   * @param {OptionValues} options
   * @returns {FillerOptions}
   */
  public static fromOptionValues(options: OptionValues): FillerOptions {
    // if the given value is not a number use the default from config
    const startBlock = isNaN(parseInt(options.startBlock))
      ? config.startBlock
      : parseToBigInt(options.startBlock);

    // if the given value is not a number use the default from config
    const endBlock = isNaN(parseInt(options.endBlock))
      ? config.endBlock
      : parseToBigInt(options.endBlock);

    // if the given value is not a number use 0
    const test = isNaN(parseInt(options.test)) ? 0 : parseInt(options.test);

    return new FillerOptions(
      startBlock,
      endBlock,
      test,
      options.replay || false
    );
  }
}
