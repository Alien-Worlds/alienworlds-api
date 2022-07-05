/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseUint8ArrayToBigInt } from '@common/block-range-scan/domain/utils/parsers';
import { ActionTrace } from '@common/actions/domain/entities/action-trace';
import { Serialize } from 'eosjs';
import { ActionProcessingJob } from '../action-processing.job';

jest.mock('eosjs');
jest.mock('@common/block-range-scan/domain/utils/parsers');

const SerialBufferMock = Serialize.SerialBuffer as jest.MockedClass<
  typeof Serialize.SerialBuffer
>;

const parseUint8ArrayToBigIntMock =
  parseUint8ArrayToBigInt as jest.MockedFunction<
    typeof parseUint8ArrayToBigInt
  >;

describe('ActionProcessingJob Unit tests', () => {
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

  it('"createBuffer" should create a buffer based on entity data', () => {
    const u8 = Uint8Array.from([0, 1, 2, 3, 4]);
    const message = {
      id: '0',
      content: Buffer.from([]),
    } as any;
    parseUint8ArrayToBigIntMock.mockReturnValue(0n);
    SerialBufferMock.prototype.getName.mockReturnValue('foo');
    SerialBufferMock.prototype.getBytes.mockReturnValue(u8);
    SerialBufferMock.prototype.getUint8Array.mockReturnValue(u8);
    SerialBufferMock.prototype.array = Uint8Array.from([]);

    const buffer = ActionProcessingJob.createBuffer(
      0n,
      ActionTrace.create('foo', {
        action_ordinal: 1,
        creator_action_ordinal: 1,
        receipt: [
          'foo',
          {
            receiver: 'foo',
            act_digest: 'act',
            global_sequence: '100',
            recv_sequence: '100',
            auth_sequence: [{ account: 'foo', sequence: 'foo_sequence' }],
            code_sequence: 100,
            abi_sequence: 100,
          },
        ],
        receiver: 'receiver',
        act: {
          account: 'foo.account',
          name: 'foo.name',
          authorization: {
            actor: 'foo.actor',
            permission: 'foo.permission',
          },
          data: [] as any,
        },
        context_free: true,
        elapsed: 'elapsed',
        console: 'foo_console',
        account_ram_deltas: [],
        except: '',
        error_code: '200',
      }),
      'trace_id',
      new Date('2022-07-01T09:59:29.035Z')
    );

    expect(
      buffer.compare(
        Uint8Array.from([
          0, 0, 0, 0, 0, 0, 0, 0, 98, 190, 197, 129, 0, 0, 0, 0, 0, 0, 0, 100,
          0, 0, 0, 0, 0, 0, 0, 100,
        ])
      )
    ).toEqual(0);
  });
});
