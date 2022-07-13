/* eslint-disable @typescript-eslint/no-unused-vars */

import { BlockRangeOrchestrator } from '../domain/block-range.orchestrator';
import { AsyncContainerModule, Container } from 'inversify';

const bindings = new AsyncContainerModule(async bind => {
  bind<BlockRangeOrchestrator>(BlockRangeOrchestrator.Token).to(
    BlockRangeOrchestrator
  );
});

export const masterIoc = new Container();
export const setupMasterIoc = async () => masterIoc.loadAsync(bindings);
