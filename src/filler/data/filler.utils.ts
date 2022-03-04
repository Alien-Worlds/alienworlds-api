import { program } from 'commander';

export const commanderParseInt = (value: string) => {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new Error('Not a number.');
  }
  return parsedValue;
};

export const buildCommand = (args: string[]) => {
  program
    .version('0.1', '-v, --version')
    .option(
      '-s, --start-block <start-block>',
      'Start at this block',
      commanderParseInt,
      -1
    )
    .option(
      '-t, --test <block>',
      'Test mode, specify a single block to pull and process',
      commanderParseInt,
      0
    )
    .option(
      '-e, --end-block <end-block>',
      'End block (exclusive)',
      commanderParseInt,
      4294967295
    )
    .option(
      '-r, --replay',
      'Force replay (ignore head block).  This option will populate a blockrange queue (must specify start block too)',
      false
    )
    .option(
      '-c, --continue-with-filler',
      'used with --replay.  This option will set a serial filler to continure after the batch',
      false
    )
    .parse(args);

  return program;
};
