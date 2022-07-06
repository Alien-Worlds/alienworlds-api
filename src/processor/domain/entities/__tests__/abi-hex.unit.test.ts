/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbiHex } from '../abi-hex';

const dto = {
  contract: 'foo.contract',
  block_num: '0',
  hex: 'foo.hex',
  filename: 'foo.file',
} as any;

describe('AbiHex unit tests', () => {
  it('AbiHex.fromDto should return AbiHex object based on dto', async () => {
    const abi = AbiHex.fromDto(dto);

    expect(abi.toJson()).toEqual({
      contract: 'foo.contract',
      blockNumber: '0',
      hex: 'foo.hex',
      filename: 'foo.file',
    });
  });

  it('AbiHex.toDto should return a dto based on entity', async () => {
    const abi = AbiHex.fromDto(dto);
    expect(abi.toDto()).toEqual(dto);
  });
});
