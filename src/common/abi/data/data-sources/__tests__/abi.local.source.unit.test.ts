/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from 'fs';
import { InvalidAbiFileNameError } from '@common/abi/domain/errors/invalid-abi-file-name.error';
import { AbiLocalSource } from '../abi.local.source';
import { AbiNotFoundError } from '@common/abi/domain/errors/abi-not-found.error';

jest.mock('fs');
const fsMock = fs as jest.MockedObject<typeof fs>;

describe('AbiLocalSource Unit tests', () => {
  afterEach(() => {
    fsMock.opendirSync.mockReset();
    fsMock.readFileSync.mockReset();
  });

  it('"extractDataFromFilename" should extract contract and block number from the file name', () => {
    const source = new AbiLocalSource();
    // @ts-ignore
    const result = source.extractDataFromFilename('m.federation-97038123.hex');

    expect(result.contract).toEqual('m.federation');
    expect(result.blockNum).toEqual('97038123');
  });

  it('"extractDataFromFilename" should throw an error when file name is invalid', () => {
    const source = new AbiLocalSource();
    try {
      // @ts-ignore
      source.extractDataFromFilename('m.federation-.hex');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidAbiFileNameError);
    }
    try {
      // @ts-ignore
      source.extractDataFromFilename('-97038123.hex');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidAbiFileNameError);
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

    const source = new AbiLocalSource();
    const result = await source.load('');

    expect(result.length).toEqual(3);
    expect(result[0]).toEqual({
      contract: 'foo',
      block_num: '12345',
      abi_hex: 'foo-abi-hex',
      filename: 'foo-12345.hex',
    });
    expect(result[1]).toEqual({
      contract: 'foo',
      block_num: '67890',
      abi_hex: 'foo-abi-hex-2',
      filename: 'foo-67890.hex',
    });
    expect(result[2]).toEqual({
      contract: 'bar',
      block_num: '11111',
      abi_hex: 'bar-abi-hex-3',
      filename: 'bar-11111.hex',
    });
  });

  it('"load" should log warning when abis map is not empty', async () => {
    fsMock.opendirSync.mockReturnValue([{ name: 'foo-12345.hex' }] as any);
    fsMock.readFileSync.mockReturnValueOnce('bar-abi-hex-3');

    const warnMock = jest.spyOn(console, 'warn');
    const source = new AbiLocalSource();
    //@ts-ignore
    source.abisByContracts.set('foo', [{}]);
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
    const source = new AbiLocalSource();
    await source.load('');

    expect(errorMock).toBeCalled();
    errorMock.mockReset();
  });

  it('"getMostRecentAbi" should throw an error when Abi was not found for given account', async () => {
    try {
      const source = new AbiLocalSource();
      await source.getMostRecentAbi('foo', 0n);
    } catch (error) {
      expect(error).toBeInstanceOf(AbiNotFoundError);
    }
  });

  it('"getMostRecentAbi" should return most recent abi when fromCurrentBlock is true', async () => {
    const source = new AbiLocalSource();
    //@ts-ignore
    source.abisByContracts.set('foo', [
      { block_num: 0n } as any,
      { block_num: 1n } as any,
      { block_num: 2n } as any,
      { block_num: 3n } as any,
    ]);

    const abi = source.getMostRecentAbi('foo', 2n, true);
    expect(abi.block_num).toEqual(2n);
  });

  it('"getMostRecentAbi" should return most recent abi when fromCurrentBlock is false', async () => {
    const source = new AbiLocalSource();
    //@ts-ignore
    source.abisByContracts.set('foo', [
      { block_num: 0n } as any,
      { block_num: 1n } as any,
      { block_num: 2n } as any,
      { block_num: 3n } as any,
    ]);

    const abi = source.getMostRecentAbi('foo', 2n, false);
    expect(abi.block_num).toEqual(1n);
  });
});
