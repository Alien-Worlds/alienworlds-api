/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActDto, ActionTraceDto } from '@common/actions/data/actions.dtos';
import { Act, ActionTrace, Receipt } from '../action-trace';

const actDto: ActDto = {
  account: 'foo.account',
  name: 'foo.name',
  authorization: {
    actor: 'foo.actor',
    permission: 'foo.permission',
  },
  data: [] as any,
};

const receiptDto = {
  receiver: 'foo',
  act_digest: 'act',
  global_sequence: '100',
  recv_sequence: '100',
  auth_sequence: [{ account: 'foo', sequence: 'foo_sequence' }],
  code_sequence: 100,
  abi_sequence: 100,
};

describe('Act Unit tests', () => {
  it('"create" should create entity', () => {
    const entity = Act.create(actDto);
    expect(entity.account).toEqual(actDto.account);
    expect(entity.name).toEqual(actDto.name);
    expect(entity.authorization).toEqual(actDto.authorization);
    expect(entity.data).toEqual(actDto.data);
  });
});

describe('Receipt Unit tests', () => {
  it('"create" should create entity', () => {
    const entity = Receipt.create('foo', receiptDto);

    expect(entity).not.toBeUndefined();
  });
});

const actionTraceDto: ActionTraceDto = {
  action_ordinal: 1,
  creator_action_ordinal: 1,
  receipt: ['foo', receiptDto],
  receiver: 'receiver',
  act: actDto,
  context_free: true,
  elapsed: 'elapsed',
  console: 'foo_console',
  account_ram_deltas: [],
  except: '',
  error_code: '200',
};

describe('ActionTrace Unit tests', () => {
  it('"create" should create entity', () => {
    const entity = ActionTrace.create('foo', actionTraceDto);

    expect(entity).not.toBeUndefined();
  });
});
