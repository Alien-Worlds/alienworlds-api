import 'reflect-metadata';
import { buildCommand } from './data/filler.utils';
import { FillerOptions } from './domain/entities/filler-options';
import { FillerCommandHandler } from './filler.command-handler';
import { setupIOC, ioc } from './ioc.config';

/**
 * IIFE Filler
 * @async
 */
(async () => {
  await setupIOC();

  const command = buildCommand(process.argv);
  const handler = ioc.get<FillerCommandHandler>(FillerCommandHandler.Token);

  await handler.run(FillerOptions.fromOptionValues(command.opts()));
})();
