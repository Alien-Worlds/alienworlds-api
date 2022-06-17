import { ActionTraceByNameDto } from '@common/actions/data/actions.dtos';

export type BlockNumberWithIdDto = {
  block_num: number;
  block_id: string;
};

export type GetBlocksResultDto = {
  head: BlockNumberWithIdDto;
  this_block: BlockNumberWithIdDto;
  last_irreversible: BlockNumberWithIdDto;
  prev_block: BlockNumberWithIdDto;
  block: Uint8Array;
  traces: Uint8Array;
  deltas: Uint8Array;
};

export type PartialDto = {
  expiration: string;
  ref_block_num: number;
  ref_block_prefix: number;
  max_net_usage_words: number;
  max_cpu_usage_ms: number;
  delay_sec: number;
  transaction_extensions: unknown[];
  signatures: unknown[];
  context_free_data: unknown[];
};

export type PartialByTypeDto = [string, PartialDto];

export type TraceDto = {
  id: string;
  status: number;
  cpu_usage_us: number;
  net_usage_words: number;
  elapsed: string;
  net_usage: string;
  scheduled: boolean;
  action_traces: ActionTraceByNameDto[];
  account_ram_delta: unknown;
  except: unknown;
  error_code: number | string;
  failed_dtrx_trace: unknown;
  partial: PartialByTypeDto;
};

export type TraceByNameDto = [string, TraceDto];

export type DeltaRowDto = {
  present: boolean;
  data: Uint8Array;
};

export type DeltaDto = {
  name: string;
  rows: DeltaRowDto[];
};

export type DeltaByNameDto = [string, DeltaDto];

export type PackedTrxDto = {
  signatures: string[];
  compression: number;
  packed_context_free_data: unknown;
  packed_trx: Uint8Array;
};
export type TrxByNameDto = [string, PackedTrxDto | string];

export type TransactionDto = {
  status: number;
  cpu_usage_us: number;
  net_usage_words: number;
  trx: TrxByNameDto;
};

export type BlockDto = {
  timestamp: string;
  producer: string;
  confirmed: number;
  previous: string;
  transaction_mroot: string;
  action_mroot: string;
  schedule_version: number;
  new_producers: unknown;
  header_extensions: unknown[];
  producer_signature: string;
  transactions: TransactionDto[];
};
