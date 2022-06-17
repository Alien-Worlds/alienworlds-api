/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { removeUndefinedProperties } from '../dto.utils';

describe('"DTO Utils" unit tests', () => {
  it('Should remove all undefined and empty -objects- properties', () => {
    const result = removeUndefinedProperties({
      a: 1,
      b: [],
      c: {
        ca: undefined,
        cb: {
          cba: undefined,
        },
        cc: true,
        cd: false,
      },
    });

    expect(result).toEqual({
      a: 1,
      b: [],
      c: {
        cc: true,
        cd: false,
      },
    });
  });
});
