import { Messages } from '@core/domain/messages';
import {
  StateReceiver,
  StateReceiverFactory,
} from '@core/domain/state-receiver';
import { inject, injectable } from 'inversify';
import { config } from '../../../config';
import { Result } from '../../../core/domain/result';
import { UseCase } from '../../../core/domain/use-case';
import { TraceHandler } from '../../../handlers/trace-handler';
import { StatsDisplay } from '../../../include/statsdisplay';
import { BlocksRange } from '../entities/blocks-range';

/**
 * @class
 */
@injectable()
export class SetupStateReceiverUseCase implements UseCase<StateReceiver> {
  public static Token = 'SETUP_STATE_RECEIVER_USE_CASE';

  /**
   * @constructor
   * @param {Messages} messages
   * @param {(startBlock, endBlock) => StateReceiver} stateReceiverFactory
   */
  constructor(
    @inject(Messages.Token) private messages: Messages,
    @inject(StateReceiverFactory.Token)
    private stateReceiverFactory: (
      startBlock: number,
      endBlock: number,
      mode: number
    ) => StateReceiver
  ) {}

  /**
   * Initializes and returns a StateReceiver object.
   *
   * @param {BlocksRange} blocksRange
   * @returns {Result<StateReceiver>}
   */
  public execute(blocksRange: BlocksRange): Result<StateReceiver> {
    const { start: startBlock, end: endBlock } = blocksRange;
    const traceHandler = new TraceHandler(
      config,
      this.messages,
      new StatsDisplay()
    );
    const stateReceiver = this.stateReceiverFactory(startBlock, endBlock, 0);
    stateReceiver.registerTraceHandler(traceHandler);

    return Result.withContent(stateReceiver);
  }
}
