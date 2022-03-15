import { BlocksRange } from '@common/block/domain/entities/blocks-range';
import { Message, Messages } from '@core/domain/messages';
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
      startBlock: bigint,
      endBlock: bigint,
      mode: number
    ) => StateReceiver
  ) {}

  /**
   * Initializes and returns a eosDAC StateReceiver object.
   *
   * @param {Message} message
   * @returns {Result<StateReceiver>}
   */
  public execute(message: Message): Result<StateReceiver> {
    const { start: startBlock, end: endBlock } =
      BlocksRange.fromMessage(message);
    const stats = new StatsDisplay();
    const traceHandler = new TraceHandler(config, this.messages, stats);
    const stateReceiver = this.stateReceiverFactory(startBlock, endBlock, 0);
    stateReceiver.registerTraceHandler(traceHandler);
    stateReceiver.registerDoneHandler(() => {
      this.messages.ack(message);
      stats.add(`Processed range`);
      console.log(
        `Completed range ${startBlock.toString()}-${endBlock.toString()}`
      );
    });
    return Result.withContent(stateReceiver);
  }
}
