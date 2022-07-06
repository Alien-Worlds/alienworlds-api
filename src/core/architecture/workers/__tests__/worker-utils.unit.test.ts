/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getWorkersCount } from '../worker.utils';

jest.mock(
  'os',
  jest.fn(() => ({
    cpus: () => [1, 2, 3, 4, 5, 6],
  }))
);

describe('"Worker Utils" unit tests', () => {
  it('Should return a proper amout of the available threads based on the provided numbers', () => {
    const result = getWorkersCount(4, 2);

    expect(result).toEqual(4);
  });

  it('Should return a proper amout of the available threads based on the cpus data and provided numbers', () => {
    const result = getWorkersCount(0, 2);

    expect(result).toEqual(4);
  });
});
