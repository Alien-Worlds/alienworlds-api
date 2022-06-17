export type ActionDto = {
  name: 'create' | 'issue' | 'retire' | 'transfer' | 'close' | string; // The name of the action as defined in the contract
  type: 'create' | 'issue' | 'retire' | 'transfer' | 'close' | string; // The name of the implicit struct as described in the ABI
  ricardian_contract: string; // An optional ricardian clause to associate to this action describing its intended functionality.
};

export type AuthSequenceDto = {
  account: string;
  sequence: string;
};

export type ReceiptDto = {
  receiver: string;
  act_digest: string;
  global_sequence: string;
  recv_sequence: string;
  auth_sequence: AuthSequenceDto[];
  code_sequence: number;
  abi_sequence: number;
};

export type ReceiptByNameDto = [string, ReceiptDto];

export type ActDto = {
  account: string;
  name: string;
  authorization: { actor: string; permission: string };
  data: Uint8Array;
};

export type ActionTraceDto = {
  action_ordinal: number;
  creator_action_ordinal: number;
  receipt: ReceiptByNameDto;
  receiver: string;
  act: ActDto;
  context_free: boolean;
  elapsed: string;
  console: string;
  account_ram_deltas: unknown[];
  except: unknown;
  error_code: string | number;
};

export type ActionTraceByNameDto = [string, ActionTraceDto];
