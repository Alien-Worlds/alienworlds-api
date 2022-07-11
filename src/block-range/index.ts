import 'reflect-metadata';

import * as cluster from 'cluster';
import commander from 'commander';
import { setupMasterIoc, masterIoc } from './ioc/master.ioc.config';
import { setupProcessIoc, processIoc } from './ioc/process.ioc.config';
import { BlockRangeProcess } from './domain/block-range.process';
import { BlockRangeOrchestrator } from './domain/block-range.orchestrator';
import { BlockRangeOptions } from './domain/entities/block-range-options';

/**
 * IIFE BlockRange
 *
 * @async
 */
const start = async optionValues => {
  const options = BlockRangeOptions.fromOptionValues(optionValues);
  if (cluster.isMaster) {
    await setupMasterIoc();

    masterIoc.get<BlockRangeOrchestrator>(BlockRangeOrchestrator.Token).init();
  } else {
    await setupProcessIoc(options.scanKey);

    processIoc
      .get<BlockRangeProcess>(BlockRangeProcess.Token)
      .start(options.scanKey);
  }
};

commander
  .version('0.1', '-v, --version')
  .option('-k, --scan-key <scan-key>', 'Scan key', '')
  .parse(process.argv);

start(commander.opts());
