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
    await saveAbisToFiles(account, content, directory);
  }
};
