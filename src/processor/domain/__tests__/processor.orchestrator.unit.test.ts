/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { config, Config } from '@config';
import * as workers from '../processor.orchestrator';

jest.mock('mongodb', jest.fn());
jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

jest.mock('os', () => ({
  cpus: () => ({
    length: 10,
  }),
  type: jest.fn(),
}));

const mockedWorker = {
  on: jest.fn(),
  send: jest.fn(),
};

jest.mock('cluster', () => ({
  fork: () => mockedWorker,
}));

jest.mock('../ioc.config', () => {
  return {
    container: {
      get: (token: string) => ({
        run: jest.fn(),
      }),
    },
    setupIOC: jest.fn(),
    setupProcessorIOC: jest.fn(),
  };
});

describe('Workers Unit tests', () => {
  it('"getProcessorWorkersCount" should return the number of processor threads, reduced by the number of inviolable threads', () => {
    configMock.processorInviolableThreads = 4;
    const count = workers.getProcessorWorkersCount(configMock);

    expect(count).toEqual(6);
  });

  it('"getProcessorWorkersCount" should return the number of processor threads set in the config', () => {
    configMock.processorThreads = 4;
    const count = workers.getProcessorWorkersCount(configMock);

    expect(count).toEqual(4);
  });
});
