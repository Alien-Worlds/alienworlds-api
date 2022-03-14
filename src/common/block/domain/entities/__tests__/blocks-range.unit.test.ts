/* eslint-disable @typescript-eslint/no-explicit-any */

import { config, Config } from '@config';
import { parseUint8ArrayToBigInt } from '../../utils/parsers';
import { BlocksRange } from '../blocks-range';

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

jest.mock('eosjs');

jest.mock('../../utils/parsers');
const parseUint8ArrayToBigIntMock =
  parseUint8ArrayToBigInt as jest.MockedFunction<
    typeof parseUint8ArrayToBigInt
  >;

describe('BlocksRange Unit tests', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('Should create a BlockRange instance with default number values', () => {
    configMock.startBlock = 100;
    configMock.endBlock = 200;

    const range = BlocksRange.create();
    expect(range).toBeInstanceOf(BlocksRange);
    expect(range.start).toEqual(configMock.startBlock);
    expect(range.end).toEqual(configMock.endBlock);
  });

  it('Should create a BlockRange instance with given number values', () => {
    configMock.startBlock = NaN;
    configMock.startBlock = NaN;
    const range = BlocksRange.create(100, 200);
    expect(range).toBeInstanceOf(BlocksRange);
    expect(range.start).toEqual(100);
    expect(range.end).toEqual(200);
  });

  it('Should create a BlockRange instance with BigInt values', () => {
    parseUint8ArrayToBigIntMock
      .mockReturnValueOnce(0n)
      .mockReturnValueOnce(100n);
    const range = BlocksRange.fromMessage({} as any);
    expect(range).toBeInstanceOf(BlocksRange);
    expect(range.start).toEqual(0n);
    expect(range.end).toEqual(100n);
  });
});
