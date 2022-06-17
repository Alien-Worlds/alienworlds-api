import 'reflect-metadata';
import commander from 'commander';
import { FillerReplayModeProcess } from './domain/processes/filler-replay-mode.process';
import { setupIOC, fillerIoc } from './ioc.config';
import { programParseInt } from '@common/utils/program.utils';
import { FillerTestModeProcess } from './domain/processes/filler-test-mode.process';
import { FillerDefaultModeProcess } from './domain/processes/filler-default-mode.process';
import { FillerOptions } from './domain/entities/filler-options';

/**
 * Filler
 *
 * Read raw action data from blockchain nodes and distributes
 * it through the message broker to other services/ processes.
 *
 * @async
 */
const start = async optionValues => {
  const options = FillerOptions.fromOptionValues(optionValues);
  const { replay, test } = options;
  await setupIOC(options);

  if (test) {
    console.log(`Starting Filler in test mode`);
    return fillerIoc
      .get<FillerTestModeProcess>(FillerTestModeProcess.Token)
      .start(options);
  }

  if (replay) {
    console.log(`Starting Filler in replay mode`);
    return fillerIoc
      .get<FillerReplayModeProcess>(FillerReplayModeProcess.Token)
      .start(options);
  }

  console.log(`Starting Filler in default mode`);
  // TODO: Do we really need to run the same code here as in block-range process?
  // The difference is to set the startBlock, endBlock (that we can do here), but send all work to the block-range process
  // with a different scanKey and range values. If we run the filler in this mode, the replay is not running,
  // which causes the block-range process to run for a while (if it doesn't find anything to do from DB) and closes
  // (a bit like wasting a process).
  // Do we want to use workers here?
  return fillerIoc
    .get<FillerDefaultModeProcess>(FillerDefaultModeProcess.Token)
    .start(options);
};

commander
  .version('0.1', '-v, --version')
  .option(
    '-s, --start-block <start-block>',
    'Start at this block',
    programParseInt,
    -1
  )
  .option(
    '-t, --test <block>',
    'Test mode, specify a single block to pull and process',
    programParseInt,
    0
  )
  .option(
    '-e, --end-block <end-block>',
    'End block (exclusive)',
    programParseInt,
    4294967295
  )
  .option(
    '-r, --replay',
    'Force replay (ignore head block). This option will populate a blockrange queue (must specify start block too)',
    false
  )
  .parse(process.argv);

// start(commander.opts());
