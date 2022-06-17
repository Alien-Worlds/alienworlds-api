/* eslint-disable @typescript-eslint/no-unused-vars */

import { AbiHexRepositoryImpl } from '../data/repositories/abi-hex.repository-impl';
import { AbiEosService } from '@common/abi/data/services/abieos.service';
import { AbiHexRepository } from '../domain/abi-hex.repository';
import { config } from '@config';
import { AsyncContainerModule, Container } from 'inversify';
import { ProcessorOrchestrator } from '../domain/processor.orchestrator';
import { AbiHexLocalSource } from '../data/data-sources/abi-hex.local.source';

const bindings = new AsyncContainerModule(async bind => {
  /**
   * ABI *.hex files
   */
  const abiLocalSource = new AbiHexLocalSource();
  const abieosService = new AbiEosService();
  const abiHexRepository = new AbiHexRepositoryImpl(
    abiLocalSource,
    abieosService
  );
  bind<AbiEosService>(AbiEosService.Token).toConstantValue(abieosService);
  bind<AbiHexRepository>(AbiHexRepository.Token).toConstantValue(
    abiHexRepository
  );
  // Load ABI hex files and pass it to the orchestrator so it can pass it to each worker
  const { content, failure } = await abiHexRepository.load(config.abisPath);

  if (failure) {
    throw failure.error;
  }

  bind<ProcessorOrchestrator>(ProcessorOrchestrator.Token).toConstantValue(
    new ProcessorOrchestrator(content.map(abi => abi.toDto()))
  );
});

export const orchestratorIoc = new Container();
export const setupOrchestratorIoc = async () =>
  orchestratorIoc.loadAsync(bindings);
