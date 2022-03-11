import { inject, injectable } from 'inversify';
import { CommandHandler } from '../../core/domain/command-handler';
import { FillerOptions } from './entities/filler-options';
import { ShiftBlocksRangeUseCase } from './use-cases/shift-blocks-range.use-case';
import { GetBlocksRangeUseCase } from './use-cases/get-blocks-range.use-case';
import { PopulateBlockRangesUseCase } from './use-cases/populate-block-ranges.use-case';
import { SetupStateReceiverUseCase } from './use-cases/setup-state-receiver.use-case';

/**
 * @class
 */
@injectable()
export class FillerCommandHandler extends CommandHandler {
  public static Token = 'FILLER_COMMAND_HANDLER';

  @inject(GetBlocksRangeUseCase.Token)
  private getBlocksRangeUseCase: GetBlocksRangeUseCase;

  @inject(SetupStateReceiverUseCase.Token)
  private setupStateReceiverUseCase: SetupStateReceiverUseCase;

  @inject(PopulateBlockRangesUseCase.Token)
  private populateBlockRangesUseCase: PopulateBlockRangesUseCase;

  @inject(ShiftBlocksRangeUseCase.Token)
  private shiftBlocksRangeUseCase: ShiftBlocksRangeUseCase;

  /**
   * Read raw action data from blockchain nodes and distributes
   * it through the message broker to other services/ processes.
   *
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
        blocksRange
      );

      if (populateResult.isFailure) {
        // TODO: what if failure?
      }

      if (continueWithFiller) {
        console.log(
          'Prepare the startBlock and endBlock to continue a filler after the replay has been scheduled instead of exiting the process.'
        );
        const shiftResult = await this.shiftBlocksRangeUseCase.execute(
          blocksRange
        );
        blocksRange = shiftResult.content;
      } else {
        process.exit(0);
      }
    }

    const { content: stateReceiver, failure } =
      this.setupStateReceiverUseCase.execute(blocksRange);

    if (failure) {
      throw failure.error;
    }

    stateReceiver.start();
  }
}
