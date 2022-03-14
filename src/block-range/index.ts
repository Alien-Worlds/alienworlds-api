import * as cluster from 'cluster';
import { config } from '@config';
import { ioc, setupIOC } from './ioc.config';
import {
  getWorkersCount,
  spawnWorkerProcesses,
} from './data/block-range.utils';
import { BlockRangeCommandHandler } from './domain/block-range.command-handler';

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
