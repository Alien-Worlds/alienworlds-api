import 'reflect-metadata';

import * as cluster from 'cluster';
import { orchestratorIoc, setupOrchestratorIoc } from './ioc/master.ioc.config';
import { ProcessorOrchestrator } from './domain/processor.orchestrator';
import { processIoc, setupProcessIoc } from './ioc/process.ioc.config';
import { ProcessorProcess } from './domain/processor.process';
import { AbiHexFile } from 'processor/data/abi-hex.dto';

/**
 * IIFE Processor
 *
 * @async
 */
(async () => {
  if (cluster.isMaster) {
    console.log(`Starting Processor orchestrator`);
    await setupOrchestratorIoc();
    orchestratorIoc
      .get<ProcessorOrchestrator>(ProcessorOrchestrator.Token)
      .init();
  } else {
    console.log(`Starting Processor process`);

    process.once('message', async (data: AbiHexFile[]) => {
      console.log(`Received ABI hex files data.`);
      await setupProcessIoc(data);
      processIoc.get<ProcessorProcess>(ProcessorProcess.Token).start();
    });
  }
})();
