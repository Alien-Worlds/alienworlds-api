/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Process } from '../process';
import { WorkerOrchestrator } from '../worker-orchestrator';

jest.mock('../worker-orchestrator');

describe('"Process" unit tests', () => {
  it('"addMessageHandler" should add message handler to the map', () => {
    const process = new Process();
    process.addMessageHandler('error', () => {});

    expect((process as any).handlersByMessageType.get('error')).not.toBeNull();
  });

  it('"handleMessage" should call handler assigned to the message', () => {
    const process = new Process();
    const worker = {
      on: jest.fn(),
      send: jest.fn(),
      process: { pid: 111 },
    };
    const message = { pid: 111, type: 'error' };
    const handler = jest.fn();
    process.addMessageHandler('error', handler);
    (process as any).handlersByMessageType.set(message.pid, worker);

    (process as any).handleMessage(message);

    expect(handler).toBeCalledTimes(1);
  });

  it('"sendToMainThread" should call WorkerOrchestrator.sendToOrchestrator', () => {
    const process = new Process();
    WorkerOrchestrator.sendToOrchestrator = jest.fn();

    process.sendToMainThread({} as any);

    expect(WorkerOrchestrator.sendToOrchestrator).toBeCalled();
  });
});
