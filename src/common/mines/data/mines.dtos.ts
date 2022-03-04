import { WithId } from 'mongodb';

/**
 * Represents the data structure of the Mine mongoDB document
 * @type
 */
export type MineDocument = {
  _id: string;
  miner: string;
  params: {
    invalid?: number;
    error?: string;
    delay?: number;
    difficulty?: number;
    ease?: number;
    luck?: number;
    commission?: number;
  };
  bounty: number;
  land_id: string;
  planet_name: string;
  landowner: string;
  bag_items: number[];
  offset: number;
  block_num: number;
  block_timestamp: string;
  global_sequence: number;
  tx_id: string;
} & WithId<Document>;
