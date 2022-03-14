/**
 * @param {Uint8Array} buffer
 * @returns {BigInt}
 */
export const parseUint8ArrayToBigInt = (buffer: Uint8Array) => {
  const hex = [];
  const u8 = Uint8Array.from(buffer);

  u8.forEach(function (i) {
    let h = i.toString(16);
    if (h.length % 2) {
      h = '0' + h;
    }
    hex.push(h);
  });

  return BigInt('0x' + hex.join(''));
};
