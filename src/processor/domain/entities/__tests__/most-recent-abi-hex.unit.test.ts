/* eslint-disable @typescript-eslint/no-explicit-any */
import { MostRecentAbiHex } from '../most-recent-abi-hex';

const abiDto = {
  contract: 'foo.contract',
  block_num: '0',
  abi_hex: 'foo.hex',
  filename: 'foo.file',
} as any;

describe('MostRecentAbi unit tests', () => {
  it('MostRecentAbi.create should return MostRecentAbi object based on dto', async () => {
    const mostRecentAbi = MostRecentAbiHex.create(abiDto, true);
    expect(mostRecentAbi).toEqual({
      data: {
        contract: 'foo.contract',
        blockNumber: 0n,
        abiHex: 'foo.hex',
        filename: 'foo.file',
      },
      hasChanged: true,
    });
  });
});
