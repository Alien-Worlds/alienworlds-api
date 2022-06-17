import { Long } from 'mongodb';

export type TransactionId = string;

/**
 * Represents the data structure of the Mine params data
 *
 * @type
 */
export type MineParamsData = {
  invalid?: number;
  error?: string;
  delay?: number;
  difficulty?: number;
  ease?: number;
  luck?: number;
  commission?: number;
};

/**
 * Represents the data structure of the Mine mongoDB document
 *
 * @type
 */
export type MineDocument = {
  _id?: string;
  miner?: string;
  params?: MineParamsData;
  bounty?: number;
  land_id?: string;
  planet_name?: string;
  landowner?: string;
  bag_items?: Long[];
  offset?: number;
  block_num?: Long;
  block_timestamp?: Date;
  global_sequence?: Long;
  tx_id?: TransactionId;
};

/**
 * Represents the data structure of the Mine message data
 *
 * @type
 */
export type MineMessageData = {
  miner: string;
  params: MineParamsData;
  bounty?: string;
  land_id?: string;
  planet_name?: string;
  landowner?: string;
  bag_items?: string[];
  offset?: number;
};
