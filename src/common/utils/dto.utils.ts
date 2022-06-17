import { Long } from 'mongodb';

/**
 * Remove undefined properties and empty objects.
 * Mainly used when creating DTOs to send to a data source.
 *
 * @param {unknown} input
 * @returns {unknown}
 */
export const removeUndefinedProperties = <T>(input: unknown): T => {
  const output = Array.isArray(input) ? [] : {};
  for (const key of Object.keys(input)) {
    const value = input[key];

    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      output[key] = removeUndefinedProperties(value);
      continue;
    }

    if (value.constructor.name === 'Object') {
      const cleared = removeUndefinedProperties(value);
      // if the cleared object is empty then do not add it
      if (Object.keys(cleared).length > 0) {
        output[key] = cleared;
      }
      continue;
    }

    output[key] = value;
  }
  return output as T;
};

/**
 *
 * @param {unknown} value
 * @returns {bigint}
 */
export const parseToBigInt = (value: unknown): bigint => {
  if (value instanceof Long) {
    return value.toBigInt();
  }
  return BigInt(value as string | number | bigint | boolean);
};
