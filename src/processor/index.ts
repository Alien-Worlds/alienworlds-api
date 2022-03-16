import * as cluster from 'cluster';
import { config } from '@config';
import { ioc, setupIOC } from './ioc.config';

import { ProcessorCommandHandler } from './domain/processor.command-handler';

/**
 * IIFE Processor
 *
 * @async
 */
(async () => {
  if (cluster.isMaster) {
    //
  } else {
    await setupIOC();
    const handler = ioc.get<ProcessorCommandHandler>(
      ProcessorCommandHandler.Token
    );

    handler.run();
  }
})();
