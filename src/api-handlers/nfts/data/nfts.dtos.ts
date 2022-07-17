import { Long } from 'mongodb';

/**
 * Represents the available /nfts request query options
 * @type
 */
export type NftsRequestOptionsDto = {
  limit?: number;
  global_sequence_from?: number;
  global_sequence_to?: number;
  sort?: 'asc' | 'desc';
  miner?: string;
  rarity?: string;
  land_id?: string;
  from?: string;
  to?: string;
};

/**
 * Represents nft search query options
 * @type
 */
export type NFTSearchQuery = {
  block_timestamp?: { $gte?: Date; $lt?: Date };
  global_sequence?: { $gte?: Long; $lt?: Long };
  miner?: string;
  land_id?: { $in: string[] };
  'template_data.rarity'?: string;
};
