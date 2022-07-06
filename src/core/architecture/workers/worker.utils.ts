import * as os from 'os';
/**
 * Get the number of workers from configuration
 * or based on the number of available CPU cores.
 * The number of CPU cores is reduced by
 * a constant specified in the configuration.
 *
 * @param {Config} config
 * @returns {number}
 */
export const getWorkersCount = (
  threadsCount: number,
  inviolableThreadsCount: number
) => {
  if (threadsCount === 0 || isNaN(threadsCount)) {
    const cpus = os.cpus().length;
    return cpus - inviolableThreadsCount;
  }

  return threadsCount;
};
