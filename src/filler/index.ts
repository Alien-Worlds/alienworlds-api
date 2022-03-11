import 'reflect-metadata';
import { buildCommand } from './data/filler.utils';
import { FillerOptions } from './domain/entities/filler-options';
import { FillerCommandHandler } from './domain/filler.command-handler';
import { setupIOC, ioc } from './ioc.config';

/**
 * IIFE Filler
 *
 * Read raw action data from blockchain nodes and distributes
 * it through the message broker to other services/ processes.
 *
 * Command options:
 * @see {@link ./data/filler.utils.ts}
 *
 * @async
 */
(async () => {
  await setupIOC();

  const command = buildCommand(process.argv);
  const handler = ioc.get<FillerCommandHandler>(FillerCommandHandler.Token);

  await handler.run(FillerOptions.fromOptionValues(command.opts()));
})();
