/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { getWorkersCount } from '@core/architecture/workers/worker.utils';
import { ProcessorOrchestrator } from '../processor.orchestrator';
import {
  WorkerMessage,
  WorkerMessageType,
} from '@core/architecture/workers/worker-message';

jest.mock('@core/architecture/workers/worker.utils');

const getWorkersCountMock = getWorkersCount as jest.MockedFunction<any>;

describe('ProcessorOrchestrator Unit tests', () => {
  it('Should call getWorkersCount to count ', () => {
    const orchestrator = new ProcessorOrchestrator([]);

    expect(getWorkersCountMock).toBeCalled();
  });

  it('"init" should setup message handlers and init workers', async () => {
    const orchestrator = new ProcessorOrchestrator([]);

    const initWorkersMock = jest
      .spyOn(orchestrator, 'initWorkers')
      .mockImplementation();
    const addMessageHandlerMock = jest
      .spyOn(orchestrator, 'addMessageHandler')
      .mockImplementation();

    await orchestrator.init();
    expect(initWorkersMock).toBeCalled();
    expect(JSON.stringify(addMessageHandlerMock.mock.calls)).toEqual(
      JSON.stringify([
        [WorkerMessageType.Error, () => {}],
        [WorkerMessageType.Warning, () => {}],
      ])
    );

    addMessageHandlerMock.mockClear();
  });

  it('Should replace worker with new one on worker error message', async () => {
    const orchestrator = new ProcessorOrchestrator([]);

    const initWorkersMock = jest
      .spyOn(orchestrator, 'initWorkers')
      .mockImplementation();
    const removeWorkerMock = jest
      .spyOn(orchestrator, 'removeWorker')
      .mockImplementation();
    const addWorkerMock = jest
      .spyOn(orchestrator, 'addWorker')
      .mockImplementation();

    await orchestrator.init();

    (orchestrator as any).workersByPid.set(0, {});
    (orchestrator as any).onWorkerMessage(
      WorkerMessage.create({
        pid: 0,
        type: WorkerMessageType.Error,
        name: 'SOME_ERROR_NAME',
        error: new Error('SOME_ERROR'),
      })
    );

    expect(removeWorkerMock).toBeCalled();
    expect(addWorkerMock).toBeCalled();

    addWorkerMock.mockClear();
    removeWorkerMock.mockClear();
    initWorkersMock.mockClear();
  });

  it('Should log warning on worker warning message', async () => {
    const orchestrator = new ProcessorOrchestrator([]);

    const initWorkersMock = jest
      .spyOn(orchestrator, 'initWorkers')
      .mockImplementation();
    const logMock = jest.spyOn(console, 'log').mockImplementation();

    await orchestrator.init();

    (orchestrator as any).workersByPid.set(0, {});
    (orchestrator as any).onWorkerMessage(
      WorkerMessage.create({
        pid: 0,
        type: WorkerMessageType.Warning,
        name: 'SOME_ERROR_NAME',
        error: new Error('SOME_ERROR'),
      })
    );

    expect(logMock).toBeCalled();

    logMock.mockClear();
    initWorkersMock.mockClear();
  });
});
