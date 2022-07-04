/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Transaction } from '../transaction';

const dto = {
  status: 0,
  cpu_usage_us: 1,
  net_usage_words: 2,
  trx: ['', ''] as any,
};

describe('Transaction Unit tests', () => {
  it('"create" should create Transaction entity based on given DTO', async () => {
    const entity = Transaction.create(dto);
    expect(entity).toBeInstanceOf(Transaction);
  });

  it('"create" should log warning on unknown trx type', async () => {
    dto.trx = ['foo', ''];
    const entity = Transaction.create(dto);
    expect(entity).toBeInstanceOf(Transaction);
  });

  it('"create" should create Trx entity when trx type is "transaction_id"', async () => {
    dto.trx = ['transaction_id', 'content'];
    const entity = Transaction.create(dto);
    expect(entity).toBeInstanceOf(Transaction);
  });

  it('"create" should create PackedTrx entity when trx type is "transaction_id"', async () => {
    dto.trx = [
      'packed_transaction',
      {
        signatures: [],
        compression: 0,
        packed_context_free_data: '',
        packed_trx: Uint8Array.from([]),
      },
    ];
    const entity = Transaction.create(dto);
    expect(entity).toBeInstanceOf(Transaction);
  });
});
