/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { parseDateToMs } from '../date.utils';

jest.useFakeTimers('modern');
jest.setSystemTime(new Date(2022, 4, 5));

describe('"Date Utils" unit tests', () => {
  it('Should convert value to the bigint', () => {
    const result = parseDateToMs('2022-06-24T19:01:30.911Z');

    expect(result).toEqual(1656097290000);
  });
});
