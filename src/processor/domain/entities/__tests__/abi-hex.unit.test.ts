/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbiHex } from '../abi-hex';

const dto = {
  contract: 'foo.contract',
  block_num: '0',
  abi_hex: 'foo.hex',
  filename: 'foo.file',
} as any;

describe('AbiHex unit tests', () => {
  it('AbiHex.fromDto should return Abi object based on dto', async () => {
    const abi = AbiHex.fromDto(dto);
    expect(abi).toEqual({
      contract: 'foo.contract',
      blockNumber: 0n,
      abiHex: 'foo.hex',
      filename: 'foo.file',
    });
  });

  it('AbiHex.toDto should return a dto based on entity', async () => {
    const abi = AbiHex.fromDto(dto);
    expect(abi.toDto()).toEqual(dto);
  });
});
