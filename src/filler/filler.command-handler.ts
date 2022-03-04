import { inject, injectable } from 'inversify';
import { CommandHandler } from '../core/domain/command-handler';
import { FillerOptions } from './domain/entities/filler-options';
import { GetBlocksRangeUseCase } from './domain/use-cases/get-blocks-range.use-case';
import { PopulateBlockRangesUseCase } from './domain/use-cases/populate-block-ranges.use-case';
import { SetupStateReceiverUseCase } from './domain/use-cases/setup-state-receiver.use-case';

@injectable()
export class FillerCommandHandler extends CommandHandler {
  public static Token = 'FILLER_COMMAND_HANDLER';

  @inject(GetBlocksRangeUseCase.Token)
  private getBlocksRangeUseCase: GetBlocksRangeUseCase;

  @inject(SetupStateReceiverUseCase.Token)
  private setupStateReceiverUseCase: SetupStateReceiverUseCase;

  @inject(PopulateBlockRangesUseCase.Token)
  private populateBlockRangesUseCase: PopulateBlockRangesUseCase;

  /**
   * Run filler command
   * @async
   * @param {FillerOptions} options
   */
  public async run(options: FillerOptions) {
    const { replay, continueWithFiller } = options;
    const blocksRangeResult = await this.getBlocksRangeUseCase.execute(options);

    if (blocksRangeResult.isFailure) {
      throw new Error('Missing blocks range');
    }

    let blocksRange = blocksRangeResult.content;

    if (replay) {
      console.log(
        `Kicking off parallel replay, make sure you start a filler instance after this replay is complete`
      );
      const populateResult = await this.populateBlockRangesUseCase.execute(
        blocksRange,
        options
      );

      if (continueWithFiller) {
        console.log(
          'Prepare the startBlock and endBlock to continue a filler after the replay has been scheduled instead of exiting the process.'
        );
        blocksRange = populateResult.content;
      } else {
        process.exit(0);
      }
    }

    const sateReceiverResult =
      this.setupStateReceiverUseCase.execute(blocksRange);

    if (sateReceiverResult.isFailure) {
      throw new Error('Something went wrong');
    }
    const { content: sateReceiver } = sateReceiverResult;
    sateReceiver.content.start();
  }
}
