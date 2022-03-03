/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import config from '../../config';
import { Amq } from '../../connections/amq';
import { StatsDisplay } from '../../include/statsdisplay';
import { TraceHandler } from '../tracehandler';
import {
  trxId,
  actionTraceFixture,
  blockNumber,
  dateTimestamp,
  actionTraceFixtureBufferJson,
  tracesFixture,
} from './tracehandler.fixture';

jest.mock('../../connections/amq');
jest.mock('../../include/statsdisplay');

describe('TraceHandler instance Unit tests', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('"int32ToBuffer" should return correct buffer when given size and value', async () => {
    const tranceHandler = new TraceHandler(
      config,
      new Amq('', console),
      new StatsDisplay()
    );
    // @ts-ignore
    expect(tranceHandler.int32ToBuffer(404, 4).toJSON()).toEqual({
      type: 'Buffer',
      data: [0, 0, 1, 148],
    });
  });

  it('"int32ToBuffer" should return Buffer with data [0,0,0,0] when given value is NaN/null/undefined', async () => {
    const tranceHandler = new TraceHandler(
      config,
      new Amq('', console),
      new StatsDisplay()
    );
    const buffer = { type: 'Buffer', data: [0, 0, 0, 0] };
    // @ts-ignore
    expect(tranceHandler.int32ToBuffer(NaN).toJSON()).toEqual(buffer);
    // @ts-ignore
    expect(tranceHandler.int32ToBuffer(config).toJSON()).toEqual(buffer);
    // @ts-ignore
    expect(tranceHandler.int32ToBuffer(undefined).toJSON()).toEqual(buffer);
  });

  it('"createActionBuffer" should return correct buffer when', async () => {
    const tranceHandler = new TraceHandler(
      config,
      new Amq('', console),
      new StatsDisplay()
    );
    // @ts-ignore
    const buffer = tranceHandler.createActionBuffer(
      trxId,
      // @ts-ignore
      actionTraceFixture,
      blockNumber,
      dateTimestamp
    );
    expect(buffer.toJSON()).toEqual(actionTraceFixtureBufferJson);
  });

  it('"processTrace" should process trace when trace "version" is equal "transaction_trace_v0"', async () => {
    const createActionBufferSpy = jest.spyOn(
      TraceHandler.prototype as any,
      'createActionBuffer'
    );
    const configMock: any = {
      miningContract: 'fake.account',
      atomicAssets: { contract: 'fake.account' },
      endpoints: [''],
    };
    const tranceHandler = new TraceHandler(
      configMock,
      new Amq('', console),
      new StatsDisplay()
    );
    // @ts-ignore
    tranceHandler.processTrace(blockNumber, tracesFixture, dateTimestamp);

    expect(createActionBufferSpy).toBeCalledTimes(2);

    createActionBufferSpy.mockReset();
  });
});
