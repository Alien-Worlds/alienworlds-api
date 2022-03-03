import fs from 'fs';
import fsPromises from 'fs/promises';
import { Failure } from '../../core/failure';
import { Result } from '../../core/result';
import { getActionsByAccount } from '../get-actions-by-account';
import { storeAbisByAccount } from '../store-abis-by-account';
import { saveAbisToFiles } from '../save-abis-to-files';

jest.mock('fs');
jest.mock('fs/promises');
jest.mock('../get-actions-by-account');
jest.mock('../save-abis-to-files');

const existsSyncSpy = jest.spyOn(fs, 'existsSync');
const mkdirSpy = jest.spyOn(fsPromises, 'mkdir');

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
    existsSyncSpy.mockReturnValue(true);

    await storeAbisByAccount('fake', './');
    expect(saveAbisToFilesMock).toBeCalledTimes(1);

    getActionsByAccountMock.mockReset();
    saveAbisToFilesMock.mockReset();
  });

  it('Should create the directory recursively if it does not exist', async () => {
    const getActionsByAccountMock = getActionsByAccount as jest.MockedFunction<
      typeof getActionsByAccount
    >;

    getActionsByAccountMock.mockResolvedValueOnce(Result.withContent([]));
    existsSyncSpy.mockReturnValue(false);
    mkdirSpy.mockResolvedValue('fake-path');

    await storeAbisByAccount('fake', './');

    expect(mkdirSpy).toBeCalledTimes(1);

    mkdirSpy.mockReset();
    existsSyncSpy.mockReset();
  });

  it('Should log an error when failed to create directory', async () => {
    const getActionsByAccountMock = getActionsByAccount as jest.MockedFunction<
      typeof getActionsByAccount
    >;

    getActionsByAccountMock.mockResolvedValue(Result.withContent([]));
    const consoleErrorSpy = jest.spyOn(console, 'error');
    existsSyncSpy.mockReturnValue(false);
    mkdirSpy.mockRejectedValue(new Error('soemthin went wrong'));

    await storeAbisByAccount('fake', './');

    expect(mkdirSpy).toBeCalledTimes(1);
    expect(consoleErrorSpy).toBeCalled();

    mkdirSpy.mockReset();
    existsSyncSpy.mockReset();
    consoleErrorSpy.mockReset();
  });
});
