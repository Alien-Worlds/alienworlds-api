import { MineParamsData } from '@alien-worlds/alienworlds-api-common';

/**
 * Represents the available /asset request query options
 * @type
 */
export type ListMinesRequestQuery = {
  limit?: number;
  from?: string;
  to?: string;
  global_sequence_from?: number;
  global_sequence_to?: number;
  miner?: string;
  landowner?: string;
  land_id?: string;
  planet_name?: string;
  tx_id?: string;
  sort?: string;
};

/**
 *
 * @type
 */
export type MineResultDto = {
  _id: string;
  miner: string;
  params: MineParamsData;
  bounty: number;
  land_id: string;
  planet_name: string;
  landowner: string;
  bag_items: number[];
  offset: number;
  block_num: number;
  block_timestamp: Date;
  global_sequence: number;
  tx_id: string;
};
