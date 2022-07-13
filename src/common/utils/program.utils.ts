/**
 * Parse a string argument and return an decimal number
 *
 * @param {string} value
 * @returns
 */
export const programParseInt = (value: string) => {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new Error('Not a number.');
  }
  return parsedValue;
};
