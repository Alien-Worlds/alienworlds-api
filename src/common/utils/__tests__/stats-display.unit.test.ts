/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { StatsDisplay } from '../stats-display';

jest.useFakeTimers();
jest.spyOn(global, 'setInterval');

describe('"StatsDisplay" unit tests', () => {
  it('Should create StatsDisplay instance with default and given interval value', () => {
    jest.useFakeTimers();
    const stats1 = new StatsDisplay();
    // @ts-ignore
    expect(stats1.interval).toEqual(5);
    const stats2 = new StatsDisplay(2);
    // @ts-ignore
    expect(stats2.interval).toEqual(2);
  });

  it('Should add new entry with count 0 to the buckets list', () => {
    const stats = new StatsDisplay();
    stats.add('test');
    // @ts-ignore
    const count = stats.buckets.get('test');
    expect(count).toEqual(0);
  });

  it('Should increase count value', () => {
    const stats = new StatsDisplay();
    stats.add('test');
    stats.add('test');
    // @ts-ignore
    const count = stats.buckets.get('test');
    expect(count).toEqual(1);
  });

  it('"buildLogMessage" should return correct log message', () => {
    const stats = new StatsDisplay();
    // @ts-ignore
    const message = stats.buildLogMessage('test', 2, 5);
    expect(message).toEqual(`test : 0.40/s`);
  });

  it('Should increase count value', () => {
    const stats = new StatsDisplay();
    const buildLogMessageSpy = jest
      .spyOn(stats as any, 'buildLogMessage')
      .mockImplementation(() => '');
    stats.add('test');
    stats.add('test');
    // @ts-ignore
    stats.display();
    // @ts-ignore
    expect(stats.buckets.get('test')).toEqual(0);
    expect(buildLogMessageSpy).toBeCalledTimes(1);

    buildLogMessageSpy.mockReset();
  });
});
