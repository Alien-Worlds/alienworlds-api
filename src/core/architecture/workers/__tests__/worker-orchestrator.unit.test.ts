/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cluster from 'cluster';
import 'reflect-metadata';
import {
  WorkerMessage,
  WorkerMessageType,
} from '@core/architecture/workers/worker-message';
import { WorkerOrchestrator } from '../worker-orchestrator';

jest.mock('@config', () => ({
  config: { blockrangeThreads: 8, blockrangeInviolableThreads: 2 },
}));

jest.mock('@core/architecture/workers/worker.utils', () => ({
  getWorkersCount: () => 2,
}));

describe('"Worker Orchestrator" unit tests', () => {
  it('"sendToOrchestrator" should call process.send', () => {
    const sendMock = jest.spyOn(process, 'send').mockImplementation();

    WorkerOrchestrator.sendToOrchestrator(
      WorkerMessage.create({
        pid: 1,
        type: WorkerMessageType.Info,
        name: 'SOME',
      })
    );

    expect(sendMock).toBeCalled();

    sendMock.mockClear();
  });

  it('Should create an instance with "workerMaxCount" equal ', () => {
    const orchestrator = new WorkerOrchestrator(2);
    expect((orchestrator as any).workerMaxCount).toEqual(2);
  });

  it('"initworkers" should call createWorker n times', () => {
    const orchestrator = new WorkerOrchestrator(2);
    const createWorkerMock = jest
      .spyOn(orchestrator as any, 'createWorker')
      .mockImplementation();

    orchestrator.initWorkers();

    expect(createWorkerMock).toBeCalledTimes(2);

    createWorkerMock.mockClear();
  });

  it('"sendToWorker" should send message to the selected worker', () => {
    const orchestrator = new WorkerOrchestrator(1);
    const worker = { send: (message: string) => {} };
    const pid = 111;
    (orchestrator as any).workersByPid.set(pid, worker);

    const sendMock = jest.spyOn(worker, 'send').mockImplementation();

    orchestrator.sendToWorker(pid, 'foo');

    expect(sendMock).toBeCalledTimes(1);

    sendMock.mockClear();
  });

  it('"removeWorker" should kill worker and remove it from the list', () => {
    const orchestrator = new WorkerOrchestrator(1);
    const worker = { kill: () => {} };
    const pid = 111;
    (orchestrator as any).workersByPid.set(pid, worker);

    const killMock = jest.spyOn(worker, 'kill').mockImplementation();

    orchestrator.removeWorker(pid);

    expect(killMock).toBeCalledTimes(1);
    expect((orchestrator as any).workersByPid.get(pid)).toBeUndefined();

    killMock.mockClear();
  });

  it('"addMessageHandler" should add message handler to the map', () => {
    const orchestrator = new WorkerOrchestrator(2);
    orchestrator.addMessageHandler('error', () => {});

    expect(
      (orchestrator as any).handlersByMessageType.get('error')
    ).not.toBeNull();
  });

  it('"addWorker" should add worker to the map until max worker limit is reached', () => {
    const orchestrator = new WorkerOrchestrator(2);
    const createWorkerMock = jest
      .spyOn(orchestrator as any, 'createWorker')
      .mockImplementation(() => {
        (orchestrator as any).workersByPid.set(
          Math.round(Math.random() * 100),
          {}
        );
      });

    orchestrator.addWorker();
    orchestrator.addWorker();
    orchestrator.addWorker();

    expect(createWorkerMock).toBeCalledTimes(2);

    createWorkerMock.mockClear();
  });

  it('"createWorker" should create a worker and pass data', () => {
    const orchestrator = new WorkerOrchestrator(2);
    const worker = {
      on: jest.fn(),
      send: jest.fn(),
      process: { pid: 111 },
    };
    const createWorkerMock = jest
      .spyOn(cluster, 'fork')
      .mockReturnValue(worker as any);
    const sendMock = jest.spyOn(worker, 'send').mockImplementation();

    (orchestrator as any).createWorker('foo');

    expect(sendMock).toBeCalledTimes(1);
    expect(
      (orchestrator as any).workersByPid.get(worker.process.pid)
    ).not.toBeUndefined();

    createWorkerMock.mockClear();
    sendMock.mockClear();
  });

  it('"createWorker" should create a worker and pass data', () => {
    const orchestrator = new WorkerOrchestrator(2);
    const worker = {
      on: jest.fn(),
      send: jest.fn(),
      process: { pid: 111 },
    };
    const createWorkerMock = jest
      .spyOn(cluster, 'fork')
      .mockReturnValue(worker as any);
    const sendMock = jest.spyOn(worker, 'send').mockImplementation();

    (orchestrator as any).workersByPid.set(111, {});
    (orchestrator as any).workersByPid.set(222, {});
    (orchestrator as any).workersByPid.set(333, {});

    expect(orchestrator.workerCount).toEqual(3);

    createWorkerMock.mockClear();
    sendMock.mockClear();
  });

  it('"onWorkerMessage" should call handler assigned to the message', () => {
    const orchestrator = new WorkerOrchestrator(2);
    const worker = {
      on: jest.fn(),
      send: jest.fn(),
      process: { pid: 111 },
    };
    const message = { pid: 111, type: 'error' };
    const handler = jest.fn();
    orchestrator.addMessageHandler('error', handler);
    (orchestrator as any).workersByPid.set(message.pid, worker);

    (orchestrator as any).onWorkerMessage(message);

    expect(handler).toBeCalledTimes(1);
  });
});
