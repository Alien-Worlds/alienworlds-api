/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseUint8ArrayToBigInt } from '@common/block-range-scan/domain/utils/parsers';
import { Serialize } from 'eosjs';
import { ActionProcessingJob } from '../action-processing.job';

jest.mock('eosjs');
jest.mock('@common/block/domain/utils/parsers');

const SerialBufferMock = Serialize.SerialBuffer as jest.MockedClass<
  typeof Serialize.SerialBuffer
>;

const parseUint8ArrayToBigIntMock =
  parseUint8ArrayToBigInt as jest.MockedFunction<
    typeof parseUint8ArrayToBigInt
  >;

describe('ActionMessage Unit tests', () => {
  it('Should create entity based on the message', () => {
    const u8 = Uint8Array.from([0, 1, 2, 3, 4]);
    const message = {
      id: '0',
      content: Buffer.from([]),
    } as any;
    parseUint8ArrayToBigIntMock.mockReturnValue(0n);
    SerialBufferMock.prototype.getName.mockReturnValue('foo');
    SerialBufferMock.prototype.getBytes.mockReturnValue(u8);
    SerialBufferMock.prototype.getUint8Array.mockReturnValue(u8);

    const entity = ActionProcessingJob.fromMessage(message);
    expect(entity.account).toEqual('foo');
    expect(entity.name).toEqual('foo');
    expect(entity.blockNumber).toEqual(0n);
    expect(entity.globalSequence).toEqual(0n);
    expect(entity.transactionId).toEqual('0');
    expect(entity.data).toEqual(Buffer.from(u8));
  });
});
