/* eslint-disable @typescript-eslint/no-explicit-any */

import { Serialize } from 'eosjs';
import { parseUint8ArrayToBigInt } from '../../utils/parsers';
import { BlockRange } from '../block-range';

jest.mock('eosjs');

const SerialBufferMock = Serialize.SerialBuffer as jest.MockedClass<
  typeof Serialize.SerialBuffer
>;

jest.mock('../../utils/parsers');
const parseUint8ArrayToBigIntMock =
  parseUint8ArrayToBigInt as jest.MockedFunction<
    typeof parseUint8ArrayToBigInt
  >;

describe('BlockRange Unit tests', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('Should create a BlockRange instance with given number values', () => {
    const range = BlockRange.create(100, 200);
    expect(range).toBeInstanceOf(BlockRange);
    expect(range.start).toEqual(100n);
    expect(range.end).toEqual(200n);
  });

  it('Should create a BlockRange instance with BigInt values', () => {
    SerialBufferMock.prototype.getUint8Array.mockReturnValue(
      Uint8Array.from([12, 12])
    );
    parseUint8ArrayToBigIntMock
      .mockReturnValueOnce(0n)
      .mockReturnValueOnce(100n);
    const range = BlockRange.fromMessage({} as any);
    expect(range).toBeInstanceOf(BlockRange);
    expect(range.start).toEqual(0n);
    expect(range.end).toEqual(100n);
  });
});
