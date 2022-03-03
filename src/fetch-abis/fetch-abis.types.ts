export type ProcessedActionDto = {
  account: string;
  name: string;
  authorization: AuthorizationDto[];
  data: ActionDataDto;
  hex_data: string;
};

export type ActionDataDto = {
  account: string;
  abi: string;
};

export type AuthorizationDto = {
  actor: string;
  permission: string;
};

export type AccountRamDeltaDto = {
  account: string;
  delta: number;
};

export type ActionDto = {
  timestamp: string;
  block_num: number;
  trx_id: string;
  act: ProcessedActionDto;
  notified: string[];
  account_ram_deltas: AccountRamDeltaDto[];
  global_sequence: number;
  producer: string;
  action_ordinal: number;
  creator_action_ordinal: number;
};

export type GetActionsResponseDto = {
  query_time_ms: number;
  cached: boolean;
  lib: number;
  total: { value: number; relation: string };
  actions: ActionDto[];
};
