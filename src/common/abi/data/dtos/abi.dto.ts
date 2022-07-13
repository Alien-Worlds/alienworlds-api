import { ActionDto } from '@common/actions/data/actions.dtos';

/**
 * Abi hex file raw data structure
 * @type
 */
export type AbiDto = {
  version: string;
  types: TypeDto[];
  structs: StructDto[];
  tables: TableDto[];
  actions: ActionDto[];
  ricardian_clauses: RicardianClauseDto[];
  abi_extensions: AbiExtensionDto[];
  error_messages: ErrorMessageDto[];
  variants?: VariantDto[];
};

export type ErrorMessageDto = {
  error_code: string;
  error_msg: string;
};

export type VariantDto = {
  name: string;
  types: string[];
};

export type RicardianClauseDto = {
  id: string;
  body: string;
};

export type AbiExtensionDto = {
  tag: number;
  value: string;
};

export type TypeDto = {
  new_type_name: string;
  type: string;
};

export type StructFieldDto = {
  name: string;
  type: string;
};

export type StructDto = {
  name: string;
  base: string;
  fields: StructFieldDto[];
};

export type CreateStructDto = {
  name: 'create';
  base: '';
  fields: [IssuerFieldDto, MaximumSupplyFieldDto];
};

export type IssueStructDto = {
  name: 'issue';
  base: '';
  fields: [ToFieldDto, QuantityFieldDto, MemoFieldDto];
};

export type RetireStructDto = {
  name: 'retire';
  base: '';
  fields: [QuantityFieldDto, MemoFieldDto];
};

export type TransfereStructDto = {
  name: 'transfer';
  base: '';
  fields: [FromFieldDto, ToFieldDto, QuantityFieldDto, MemoFieldDto];
};

export type CloseStructDto = {
  name: 'close';
  base: '';
  fields: [SymbolFieldDto, OwnerFieldDto];
};

export type FieldDto = {
  name: string;
  type: string;
};

export type OwnerFieldDto = {
  name: 'owner';
  type: 'name';
};

export type SymbolFieldDto = {
  name: 'symbol';
  type: 'symbol';
};

export type MemoFieldDto = {
  name: 'memo';
  type: 'string';
};

export type QuantityFieldDto = {
  name: 'quantity';
  type: 'asset';
};

export type ToFieldDto = {
  name: 'to';
  type: 'name';
};

export type FromFieldDto = {
  name: 'from';
  type: 'name';
};

export type IssuerFieldDto = {
  name: 'issuer';
  type: 'name';
};

export type MaximumSupplyFieldDto = {
  name: 'maximum_supply';
  type: 'asset';
};

export type TableDto = {
  name: string; // 'accounts' | 'stats'
  type: string; // 'account' | 'currency_stats' ... Corresponds to previously defined struct
  index_type: string; // 'i64'
  key_names: string[];
  key_types: string[];
};
