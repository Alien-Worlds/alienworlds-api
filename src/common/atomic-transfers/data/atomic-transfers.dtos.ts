import { Long } from 'mongodb';

/**
 * Represents the data structure of the AtomicTransfer document
 * @type
 */
export type AtomicTransferDocument = {
  _id?: string;
  type?: string;
  asset_ids?: Long[];
  from?: string;
  to?: string;
  block_num?: Long;
  global_sequence?: Long;
  block_timestamp?: Date;
};

/**
 * Represents the data structure of the AtomicTransfer message data
 * @type
 */
export type AtomicTransferMessageData = {
  authorized_minter: string;
  asset_id: string;
  collection_name: string;
  asset_ids: string[];
  from: string;
  to: string;
  asset_owner: string;
  new_asset_owner: string;
  schema_name: string;
  template_id: number;
  immutable_template_data: { key: string; value: unknown }[];
  immutable_data: unknown[];
  mutable_data: unknown[];
  backed_tokens: unknown[];
  memo: string;
  [key: string]: unknown;
};
