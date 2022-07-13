import 'reflect-metadata';

import * as cluster from 'cluster';
import {
  orchestratorIoc,
  setupOrchestratorIoc,
} from './ioc/orchestrator.ioc.config';
import { ProcessorOrchestrator } from './domain/processor.orchestrator';
import { processIoc, setupProcessIoc } from './ioc/process.ioc.config';
import { ProcessorProcess } from './domain/processor.process';
import { AbiHexFile } from './data/abi-hex.dto';

/**
 * This is the third element of the whole retrieving/processing (history) data from the blockchain.
 * Having already queued asset or action processing tasks, the processor listens to each of these events
 * and implements appropriate procedures to transfer data from the blockchain to the database.
 *
 * An important element of this process is sending acknowledgement or rejection of messages to the queue service
 * so that further messages can be received.
 *
 * @async
 */
(async () => {
  if (cluster.isMaster) {
    // As in blockrange, we use a few / a dozen threads to speed up the entire process.
    // We create a kind of orchestrator to manage these threads
    console.log(`Starting Processor orchestrator`);
    await setupOrchestratorIoc();
    orchestratorIoc
      .get<ProcessorOrchestrator>(ProcessorOrchestrator.Token)
      .init();
  } else {
    // Processor thread, launched only after receiving from the orchestrator the ABI list,
    // previously downloaded from * .hex files
    console.log(`Starting Processor process`);
    process.once('message', async (data: AbiHexFile[]) => {
      console.log(`Received ABI hex files data.`);
      await setupProcessIoc(data);
      processIoc.get<ProcessorProcess>(ProcessorProcess.Token).start();
    });
  }
})();
