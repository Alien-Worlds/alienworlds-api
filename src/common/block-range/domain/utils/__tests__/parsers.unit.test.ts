import { parseUint8ArrayToBigInt } from '../parsers';

describe('"parseUint8ArrayToBigInt" Unit tests', () => {
  it('Should create instance of BlockRange with default values', () => {
    const value = parseUint8ArrayToBigInt(new Uint8Array([11, 22, 33]));
    expect(value.toString()).toEqual('726561');
  });
});
