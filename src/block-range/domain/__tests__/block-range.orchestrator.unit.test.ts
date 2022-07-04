/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NoBlockRangeFoundError } from '@common/block-range-scan/domain/errors/no-block-range.found.error';
import { WorkerMessageType } from '@core/architecture/workers/worker-message';
import 'reflect-metadata';
import { BlockRangeOrchestrator } from '../block-range.orchestrator';
import { BlockRangeScanReadTimeoutError } from '../use-cases/errors/block-range-scan-read-timeout.error';

jest.mock('@config', () => ({
  config: { blockrangeThreads: 8, blockrangeInviolableThreads: 2 },
}));

jest.mock('@common/utils/worker.utils', () => ({
  getWorkersCount: () => 2,
}));

describe('"Block Range Orchestrator Utils" unit tests', () => {
  it('"Token" should be set', () => {
    expect(BlockRangeOrchestrator.Token).not.toBeNull();
  });

  it('Should create an instance with "workerMaxCount" equal ', () => {
    const orchestrator = new BlockRangeOrchestrator();
    expect((orchestrator as any).workerMaxCount).toEqual(2);
  });

  it('"init" should add error handler', async () => {
    const orchestrator = new BlockRangeOrchestrator();
    const initWorkersMock = jest
      .spyOn(orchestrator, 'initWorkers')
      .mockImplementation(() => {});

    await orchestrator.init();

    expect(
      (orchestrator as any).handlersByMessageType.has(WorkerMessageType.Error)
    ).toBeTruthy();
    initWorkersMock.mockClear();
  });

  it('"init" should add warning handler', async () => {
    const orchestrator = new BlockRangeOrchestrator();
    const initWorkersMock = jest
      .spyOn(orchestrator, 'initWorkers')
      .mockImplementation(() => {});

    await orchestrator.init();

    expect(
      (orchestrator as any).handlersByMessageType.has(WorkerMessageType.Warning)
    ).toBeTruthy();
    initWorkersMock.mockClear();
  });

  it('"init" should call "initWorkers"', async () => {
    const orchestrator = new BlockRangeOrchestrator();
    const initWorkersMock = jest
      .spyOn(orchestrator, 'initWorkers')
      .mockImplementation(() => {});

    await orchestrator.init();

    expect(initWorkersMock).toBeCalled();
    initWorkersMock.mockClear();
  });

  it('Error handler should remove worker', async () => {
    const orchestrator = new BlockRangeOrchestrator();
    const initWorkersMock = jest.spyOn(orchestrator, 'initWorkers');
    const removeWorkerMock = jest.spyOn(orchestrator, 'removeWorker');
    const addWorkerMock = jest.spyOn(orchestrator, 'addWorker');
    const exitMock = jest
      .spyOn(process, 'exit')
      .mockImplementation((value: number) => {
        throw new Error('process.exit: ' + value);
      });

    await orchestrator.init();

    const handler = (orchestrator as any).handlersByMessageType.get(
      WorkerMessageType.Error
    );
    try {
      handler({
        pid: 1,
        error: { name: BlockRangeScanReadTimeoutError.Token },
      });
    } catch (error) {
      //
    }

    expect(removeWorkerMock).toBeCalled();
    expect(addWorkerMock).not.toBeCalled();

    initWorkersMock.mockClear();
    addWorkerMock.mockClear();
    removeWorkerMock.mockClear();
    exitMock.mockClear();
  });

  it('Error handler should remove worker and add new one', async () => {
    const orchestrator = new BlockRangeOrchestrator();
    const initWorkersMock = jest.spyOn(orchestrator, 'initWorkers');
    const removeWorkerMock = jest.spyOn(orchestrator, 'removeWorker');
    const addWorkerMock = jest.spyOn(orchestrator, 'addWorker');
    const exitMock = jest
      .spyOn(process, 'exit')
      .mockImplementation((value: number) => {
        throw new Error('process.exit: ' + value);
      });

    await orchestrator.init();

    const handler = (orchestrator as any).handlersByMessageType.get(
      WorkerMessageType.Error
    );
    try {
      handler({ pid: 1, error: { name: 'SOME_ERROR' } });
    } catch (error) {
      //
    }

    expect(removeWorkerMock).toBeCalled();
    expect(addWorkerMock).toBeCalled();

    initWorkersMock.mockClear();
    addWorkerMock.mockClear();
    removeWorkerMock.mockClear();
    exitMock.mockClear();
  });

  it('Error handler should exit the process if no more workers left', async () => {
    const orchestrator = new BlockRangeOrchestrator();
    const initWorkersMock = jest
      .spyOn(orchestrator, 'initWorkers')
      .mockImplementation(() => {});
    const removeWorkerMock = jest.spyOn(orchestrator, 'removeWorker');
    const addWorkerMock = jest.spyOn(orchestrator, 'addWorker');
    const exitMock = jest.spyOn(process, 'exit').mockImplementation();

    await orchestrator.init();

    const handler = (orchestrator as any).handlersByMessageType.get(
      WorkerMessageType.Error
    );
    try {
      handler({ pid: 1, error: { name: NoBlockRangeFoundError.Token } });
    } catch (error) {
      //
    }

    expect(exitMock).toBeCalled();

    initWorkersMock.mockClear();
    addWorkerMock.mockClear();
    removeWorkerMock.mockClear();
    exitMock.mockClear();
  });
});
