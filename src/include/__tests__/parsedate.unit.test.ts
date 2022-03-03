/* eslint-disable @typescript-eslint/ban-ts-comment */
import { parseDate } from '../parsedate';

describe('"parseDate" tool unit tests', () => {
  it('Should return correct time value in milliseconds', () => {
    const time = parseDate('2022-01-20T19:29:41.294+00:00');
    expect(time).toEqual(1642706981000);
  });
});
