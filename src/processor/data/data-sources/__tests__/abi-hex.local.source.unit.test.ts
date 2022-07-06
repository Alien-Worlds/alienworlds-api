/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from 'fs';
import { AbiHexLocalSource } from '../abi-hex.local.source';
import { InvalidAbiHexFileNameError } from '../../../domain/errors/invalid-abi-hex-file-name.error';

jest.mock('fs');
const fsMock = fs as jest.MockedObject<typeof fs>;

describe('AbiLocalSource Unit tests', () => {
  afterEach(() => {
    fsMock.opendirSync.mockReset();
    fsMock.readFileSync.mockReset();
  });

  it('"extractDataFromFilename" should extract contract and block number from the file name', () => {
    const source = new AbiHexLocalSource();
    // @ts-ignore
    const result = source.extractDataFromFilename('m.federation-97038123.hex');

    expect(result.contract).toEqual('m.federation');
    expect(result.blockNumber).toEqual('97038123');
  });

  it('"extractDataFromFilename" should throw an error when file name is invalid', () => {
    const source = new AbiHexLocalSource();
    try {
      // @ts-ignore
      source.extractDataFromFilename('m.federation-.hex');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidAbiHexFileNameError);
    }
    try {
      // @ts-ignore
      source.extractDataFromFilename('-97038123.hex');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidAbiHexFileNameError);
    }
  });

  it('"load" should return an array of abis', async () => {
    fsMock.opendirSync.mockReturnValue([
      { name: 'foo-12345.hex' },
      { name: 'foo-67890.hex' },
      { name: 'bar-11111.hex' },
    ] as any);
    fsMock.readFileSync
      .mockReturnValueOnce('foo-abi-hex')
      .mockReturnValueOnce('foo-abi-hex-2')
      .mockReturnValueOnce('bar-abi-hex-3');

    const source = new AbiHexLocalSource();
    const result = await source.load('');

    expect(result.length).toEqual(3);
    expect(result[1]).toEqual({
      contract: 'foo',
      block_num: '67890',
      hex: 'foo-abi-hex-2',
      filename: 'foo-67890.hex',
    });
    expect(result[0]).toEqual({
      contract: 'foo',
      block_num: '12345',
      hex: 'foo-abi-hex',
      filename: 'foo-12345.hex',
    });
    expect(result[2]).toEqual({
      contract: 'bar',
      block_num: '11111',
      hex: 'bar-abi-hex-3',
      filename: 'bar-11111.hex',
    });
  });

  it('"load" should log warning when abis map is not empty', async () => {
    fsMock.opendirSync.mockReturnValue([{ name: 'foo-12345.hex' }] as any);
    fsMock.readFileSync.mockReturnValueOnce('bar-abi-hex-3');

    const warnMock = jest.spyOn(console, 'warn');
    const source = new AbiHexLocalSource();
    //@ts-ignore
    source.abisByContracts.set('foo', [
      {
        contract: 'foo',
        block_num: '67890',
        hex: 'foo-abi-hex-2',
        filename: 'foo-67890.hex',
      },
    ]);
    await source.load('');

    expect(warnMock).toBeCalled();
    warnMock.mockReset();
  });

  it('"load" should log an error when reading/storing one of the abis has failed', async () => {
    fsMock.opendirSync.mockReturnValue([{ name: 'foo-12345.hex' }] as any);
    fsMock.readFileSync.mockImplementationOnce(() => {
      throw new Error('some error');
    });

    const errorMock = jest.spyOn(console, 'error');
    const source = new AbiHexLocalSource();
    await source.load('');

    expect(errorMock).toBeCalled();
    errorMock.mockReset();
  });
});
