import * as cluster from 'cluster';
import { config, Config } from '@config';
import { getWorkersCount, spawnWorkerProcesses } from '../block-range.utils';
jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

jest.mock('os', () => ({
  cpus: () => ({
    length: 10,
  }),
}));

jest.mock('cluster', () => ({
  fork: jest.fn(),
}));

describe('BlockRange utils Unit tests', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('"getWorkersCount" should return number of threads based on config values', () => {
    configMock.blockrangeThreads = 8;
    const count = getWorkersCount(configMock);
    expect(count).toEqual(8);
  });

  it('"getWorkersCount" should return number of threads based on number of CPU cores when blockrangeThreads is equal 0', () => {
    configMock.blockrangeInviolableThreads = 4;
    configMock.blockrangeThreads = 0;
    const count = getWorkersCount(configMock);
    expect(count).toEqual(6);
  });

  it('"spawnWorkerProcesses" should call cluster.fork the specified number of times.', () => {
    const count = 4;
    const forkMock = jest.spyOn(cluster, 'fork');
    spawnWorkerProcesses(count);
    expect(forkMock).toBeCalledTimes(count);
  });
});
