import * as cluster from 'cluster';
import * as os from 'os';
import { Config } from '@config';

/**
 * Get the number of workers from configuration
 * or based on the number of available CPU cores.
 * The number of CPU cores is reduced by
 * a constant specified in the configuration.
 *
 * @param {Config} config
 * @returns {number}
 */
export const getWorkersCount = (config: Config) => {
  let count = config.blockrangeThreads;
  if (count === 0 || isNaN(count)) {
    const cpus = os.cpus().length;
    count = cpus - config.blockrangeInviolableThreads;
  }

  return count;
};

/**
 * Spawn the specified number of worker processes.
 *
 * @param {number} count
 */
export const spawnWorkerProcesses = (count: number) => {
  for (let i = 0; i < count; i++) {
    cluster.fork();
  }
};
