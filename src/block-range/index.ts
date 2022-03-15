import * as cluster from 'cluster';
import { config } from '@config';
import { ioc, setupIOC } from './ioc.config';
import {
  getWorkersCount,
  spawnWorkerProcesses,
} from './data/block-range.utils';
import { BlockRangeCommandHandler } from './domain/block-range.command-handler';

/**
 * IIFE BlockRange
 *
 * Coordinates parallel processes which run "aw_block_range" message consumers.
 * In their handlers, eosDAC StateReceiver is initialized and started
 * based on the value of the block range value contained in the message.
 *
 * The BlockRange is generally used as a one-off event
 * when an API instance is started and is sufficiently behind
 * the blockchain head that parallel filling would be beneficial.
 *
 * @async
 */
(async () => {
  if (cluster.isMaster) {
    const workersCount = getWorkersCount(config);
    spawnWorkerProcesses(workersCount);
  } else {
    await setupIOC();
    const handler = ioc.get<BlockRangeCommandHandler>(
      BlockRangeCommandHandler.Token
    );

    handler.run();
  }
})();
