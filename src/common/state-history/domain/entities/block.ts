/* eslint-disable @typescript-eslint/no-empty-function */

import { BlockDto } from '@common/state-history/data/state-history.dtos';
import { parseDate } from '@common/utils/date.utils';
import { Transaction } from './transaction';

export class Block {
  public static create(dto: BlockDto): Block {
    const {
      producer,
      confirmed,
      previous,
      transaction_mroot,
      action_mroot,
      schedule_version,
      new_producers,
      header_extensions,
      producer_signature,
      transactions,
    } = dto;

    const timestamp = dto.timestamp
      ? new Date(parseDate(dto.timestamp))
      : new Date();

    return new Block(
      timestamp,
      producer,
      confirmed,
      previous,
      transaction_mroot,
      action_mroot,
      schedule_version,
      new_producers,
      header_extensions,
      producer_signature,
      transactions.map(Transaction.create)
    );
  }

  private constructor(
    public readonly timestamp: Date,
    public readonly producer: string,
    public readonly confirmed: number,
    public readonly previous: string,
    public readonly transactionMroot: string,
    public readonly actionMroot: string,
    public readonly scheduleVersion: number,
    public readonly newProducers: unknown,
    public readonly headerExtensions: unknown[],
    public readonly producerSignature: string,
    public readonly transactions: Transaction[]
  ) {}
}
