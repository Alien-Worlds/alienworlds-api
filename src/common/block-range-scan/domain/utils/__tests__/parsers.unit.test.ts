import { parseUint8ArrayToBigInt } from '../parsers';

describe('Block Range Scan utils Unit tests', () => {
  it('"parseUint8ArrayToBigInt" should convert Uint8Array to BigInt', () => {
    expect(
      parseUint8ArrayToBigInt(
        Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7])
      ).toString()
    ).toEqual('283686952306183');
  });
});
