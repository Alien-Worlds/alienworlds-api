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

@injectable()
export class SetupStateReceiverUseCase extends UseCase<StateReceiver> {
  public static Token = 'SETUP_STATE_RECEIVER_USE_CASE';

  constructor(
    @inject(Messages.Token) private messages: Messages,
    @inject(StateReceiverFactory.Token)
    private stateReceiverFactory: (
      startBlock: number,
      endBlock: number,
      mode: number
    ) => StateReceiver
  ) {
    super();
  }

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
