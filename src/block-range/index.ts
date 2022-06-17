import 'reflect-metadata';

import * as cluster from 'cluster';
import { setupMasterIoc, masterIoc } from './ioc/master.ioc.config';
import { setupProcessIoc, processIoc } from './ioc/process.ioc.config';
import { BlockRangeProcess } from './domain/block-range.process';
import { BlockRangeOrchestrator } from './domain/block-range.orchestrator';
import { config } from '@config';

/**
 * IIFE BlockRange
 *
 * @async
 */
(async () => {
  if (cluster.isMaster) {
    await setupMasterIoc();

    masterIoc.get<BlockRangeOrchestrator>(BlockRangeOrchestrator.Token).init();
  } else {
    const {
      blockRangeScan: { scanKey },
    } = config;
    await setupProcessIoc();

    processIoc.get<BlockRangeProcess>(BlockRangeProcess.Token).start(scanKey);
  }
})();
