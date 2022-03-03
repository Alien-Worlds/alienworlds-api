import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { getActionsByAccount } from './get-actions-by-account';
import { saveAbisToFiles } from './save-abis-to-files';

/**
 * Get actions from the account and store the abis in *.hex files.
 *
 * @async
 * @param {string} account
 * @param {string} directory
 */
export const storeAbisByAccount = async (
  account: string,
  directory: string
): Promise<void> => {
  const { content, failure } = await getActionsByAccount(account);
  if (failure) {
    console.error(failure.error);
  } else {
    if (!existsSync(directory)) {
      await mkdir(directory, { recursive: true }).catch(console.error);
    }
    await saveAbisToFiles(account, content, directory);
  }
};
