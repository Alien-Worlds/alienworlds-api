import { OptionValues } from 'commander';
import { config } from '@config';

/**
 * @class
 */
export class FillerOptions {
  private constructor(
    public readonly startBlock: number,
    public readonly endBlock: number,
    public readonly test: number,
    public readonly replay: boolean,
    public readonly continueWithFiller: boolean
  ) {}

  /**
   * Create instance of the FillerOptions
   *
   * @static
   * @param {OptionValues} options
   * @returns {FillerOptions}
   */
  public static fromOptionValues(options: OptionValues): FillerOptions {
    const { startBlock, endBlock, test } = options;
    return new FillerOptions(
      isNaN(parseInt(startBlock)) ? config.startBlock : startBlock,
      isNaN(parseInt(endBlock)) ? config.endBlock : endBlock,
      isNaN(parseInt(test)) ? 0 : test,
      options.replay || false,
      options.continueWithFiller || false
    );
  }
}
