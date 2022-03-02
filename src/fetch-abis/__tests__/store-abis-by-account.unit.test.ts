import { Failure } from '../../core/failure';
import { Result } from '../../core/result';
import { getActionsByAccount } from '../get-actions-by-account';
import { storeAbisByAccount } from '../store-abis-by-account';
import { saveAbisToFiles } from '../save-abis-to-files';

jest.mock('../get-actions-by-account');
jest.mock('../save-abis-to-files');

describe('"storeAbisByAccount" unit tests', () => {
  it('Should log an error when "getActionsByAccount" returned failure', async () => {
    const getActionsByAccountMock = getActionsByAccount as jest.MockedFunction<
      typeof getActionsByAccount
    >;
    const consoleErrorSpy = jest.spyOn(console, 'error');

    getActionsByAccountMock.mockResolvedValueOnce(
      Result.withFailure(Failure.withMessage('Some Error'))
    );

    await storeAbisByAccount('fake', './');

    expect(consoleErrorSpy).toBeCalledTimes(1);

    getActionsByAccountMock.mockReset();
    consoleErrorSpy.mockReset();
  });

  it('Should execute "saveAbisToFiles" when "getActionsByAccount" returned array of actions dtos', async () => {
    const getActionsByAccountMock = getActionsByAccount as jest.MockedFunction<
      typeof getActionsByAccount
    >;
    const saveAbisToFilesMock = saveAbisToFiles as jest.MockedFunction<
      typeof saveAbisToFiles
    >;

    getActionsByAccountMock.mockResolvedValueOnce(Result.withContent([]));

    await storeAbisByAccount('fake', './');
    expect(saveAbisToFilesMock).toBeCalledTimes(1);

    getActionsByAccountMock.mockReset();
    saveAbisToFilesMock.mockReset();
  });
});
