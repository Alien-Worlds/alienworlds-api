/* eslint-disable @typescript-eslint/no-empty-function */

import {
  PackedTrxDto,
  TransactionDto,
} from '@common/state-history/data/state-history.dtos';

export class PackedTrx {
  public static create(type: string, dto: PackedTrxDto): PackedTrx {
    const { signatures, compression, packed_context_free_data, packed_trx } =
      dto;
    return new PackedTrx(
      type,
      signatures,
      compression,
      packed_context_free_data,
      packed_trx
    );
  }

  private constructor(
    public readonly type: string,
    public readonly signatures: string[],
    public readonly compression: number,
    public readonly packedContextFreeData: unknown,
    public readonly content: unknown //TODO: we should deserialize "packed_trx"
  ) {}
}

export class Trx {
  public static create(type: string, dto: string): Trx {
    return new Trx(type, dto);
  }

  private constructor(
    public readonly type: string,
    public readonly content: string
  ) {}
}

export class Transaction {
  public static create(dto: TransactionDto): Transaction {
    const { status, cpu_usage_us, net_usage_words } = dto;

    const [type, content] = dto.trx;
    let trx;

    switch (type) {
      case 'transaction_id': {
        trx = Trx.create(type, <string>content);
        break;
      }
      case 'packed_transaction': {
        trx = PackedTrx.create(type, <PackedTrxDto>content);
        break;
      }
      default: {
        // LOG unknown trx type
      }
    }
    return new Transaction(status, cpu_usage_us, net_usage_words, trx);
  }

  private constructor(
    public readonly status: number,
    public readonly cpuUsageUs: number,
    public readonly netUsageWords: number,
    public readonly trx: Trx | PackedTrx | unknown
  ) {}
}
