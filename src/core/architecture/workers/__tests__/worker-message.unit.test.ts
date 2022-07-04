/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { WorkerMessage } from '../worker-message';

jest.mock('../worker-orchestrator');

describe('"WorkerMessage" unit tests', () => {
  it('"toJson" should convert message to Json object', () => {
    const options = {
      pid: 1,
      type: 'error',
      name: 'SOME_NAME',
      content: 'foo',
      error: new Error('SOME_ERROR'),
    };
    const message = WorkerMessage.create(options);
    const json = message.toJson() as any;

    expect(json.pid).toEqual(options.pid);
    expect(json.type).toEqual(options.type);
    expect(json.name).toEqual(options.name);
    expect(json.content).toEqual(options.content);
    expect(json.error).not.toBeUndefined();
  });

  it('"create" should create instance of the Workermessage with given data', () => {
    const options = {
      pid: 1,
      type: 'error',
      name: 'SOME_NAME',
      content: 'foo',
      error: new Error('SOME_ERROR'),
    };
    const message = WorkerMessage.create(options);

    expect(message.pid).toEqual(options.pid);
    expect(message.type).toEqual(options.type);
    expect(message.name).toEqual(options.name);
    expect(message.content).toEqual(options.content);
    expect(message.error.message).toEqual(options.error.message);
  });
});
