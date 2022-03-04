import { OptionValues } from 'commander';
import config from '../../../config';

/* eslint-disable @typescript-eslint/no-empty-function */
export class FillerOptions {
  private constructor(
    public readonly startBlock: number,
    public readonly endBlock: number,
    public readonly test: number,
    public readonly replay: boolean,
    public readonly continueWithFiller: boolean
  ) {}

  public static fromOptionValues(options: OptionValues): FillerOptions {
    return new FillerOptions(
      options.startBlock || config.startBlock,
      options.endBlock || config.endBlock,
      options.test || 0,
      options.replay || false,
      options.continueWithFiller || false
    );
  }
}
