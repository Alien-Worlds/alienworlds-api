import { writeFile } from 'fs/promises';
import { ActionDto } from './fetch-abis.types';

/**
 * Write abis to files
 *
 * @async
 * @param {string} contract
 * @param {ActionDto[]} actions
 * @param {string} directory
 */
export const saveAbisToFiles = async (
  contract: string,
  actions: ActionDto[],
  directory: string
): Promise<void> => {
  const promises = [];
  for (const action of actions) {
    const {
      block_num,
      act: {
        data: { abi },
      },
    } = action;
    const filename = `${directory}/${contract}-${block_num}.hex`;
    promises.push(
      writeFile(filename, abi)
        .then(() => console.log(`File created: ${filename}`))
        .catch(console.error)
    );
  }
  await Promise.all(promises);
};
