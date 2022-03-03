/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs/promises';
import { saveAbisToFiles } from '../save-abis-to-files';
import {
  fakeAction,
  secondFakeAction,
} from './fixtures/save-abis-to-files.fixture';

jest.mock('fs/promises');
const writeFileSpy = jest.spyOn(fs, 'writeFile');

describe('"saveAbisToFiles" unit tests', () => {
  afterAll(() => {
    writeFileSpy.mockReset();
  });

  it('Should call writeFile for each action', async () => {
    writeFileSpy.mockResolvedValue();

    await saveAbisToFiles(
      'fake',
      [<any>fakeAction, <any>secondFakeAction],
      './'
    );

    expect(writeFileSpy).toBeCalledTimes(2);
  });

  it('Should log an error for each failed writeFile operation', async () => {
    writeFileSpy.mockRejectedValue(new Error('Some error'));
    const consoleErrorSpy = jest.spyOn(console, 'error');

    await saveAbisToFiles(
      'fake',
      [<any>fakeAction, <any>secondFakeAction],
      './'
    );

    expect(consoleErrorSpy).toBeCalledTimes(2);

    consoleErrorSpy.mockReset();
  });

  it('Should log a message for every successful writeFile operation', async () => {
    writeFileSpy.mockResolvedValue();
    const consoleLogSpy = jest.spyOn(console, 'log');

    await saveAbisToFiles(
      'fake',
      [<any>fakeAction, <any>secondFakeAction],
      './'
    );

    expect(consoleLogSpy).toBeCalledTimes(2);

    consoleLogSpy.mockReset();
  });
});
