/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Trace } from '../trace';

const dto = {
  id: 'foo',
  status: 0,
  cpu_usage_us: 100,
  net_usage_words: 100,
  elapsed: '',
  net_usage: '100',
  scheduled: false,
  action_traces: [
    [
      'action',
      {
        action_ordinal: 0,
        creator_action_ordinal: 0,
        receipt: [
          'foo_receipt',
          {
            receiver: 'receiver',
            act_digest: '',
            global_sequence: '',
            recv_sequence: '',
            auth_sequence: [],
            code_sequence: 0,
            abi_sequence: 10,
          },
        ],
        receiver: 'receiver',
        act: {},
        context_free: false,
        elapsed: 'elapsed',
        console: 'console',
        account_ram_deltas: [],
        except: '',
        error_code: '200',
      },
    ],
  ] as any,
  account_ram_delta: '',
  except: '',
  error_code: 0,
  failed_dtrx_trace: '',
  partial: [
    'foo',
    {
      expiration: '10000',
      ref_block_num: 0,
      ref_block_prefix: 0,
      max_net_usage_words: 0,
      max_cpu_usage_ms: 0,
      delay_sec: 1,
      transaction_extensions: [],
      signatures: [],
      context_free_data: [],
    },
  ] as any,
};

describe('Trace Unit tests', () => {
  it('"create" should create Trace entity based on given DTO', async () => {
    const entity = Trace.create('foo', dto);
    expect(entity).toBeInstanceOf(Trace);
  });
});
