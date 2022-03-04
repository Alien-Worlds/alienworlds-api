/* eslint-disable @typescript-eslint/no-var-requires */
const StateReceiver = require('@eosdacio/eosio-statereceiver');

import { injectable } from 'inversify';
import config from '../../../config';
import { Result } from '../../../core/domain/result';
import { UseCase } from '../../../core/domain/use-case';
import { TraceHandler } from '../../../handlers/tracehandler';
import { StatsDisplay } from '../../../include/statsdisplay';
import { BlocksRange } from '../entities/blocks-range';

@injectable()
export class SetupStateReceiverUseCase extends UseCase {
  public static Token = 'SETUP_STATE_RECEIVER_USE_CASE';

  public execute(blocksRange: BlocksRange): Result<typeof StateReceiver> {
    const { start: startBlock, end: endBlock } = blocksRange;
    const traceHandler = new TraceHandler(config, this.amq, new StatsDisplay());
    const stateReceiver = new StateReceiver({
      startBlock,
      endBlock,
      mode: 0,
      config: {
        eos: {
          wsEndpoint: config.shipEndpoints[0],
          chainId: config.chainId,
          endpoint: config.endpoints[0],
        },
      },
    });
    stateReceiver.registerTraceHandler(traceHandler);

    return Result.withContent(stateReceiver);
  }
}
