import { Long } from 'mongodb';

/**
 * Represents the data structure of the NFT "params" mongoDB sub-document
 * @type
 */
export type NftParamsData = {
  invalid?: number;
  error?: string;
  delay?: number;
  difficulty?: number;
  ease?: number;
  luck?: number;
  commission?: number;
};
/**
 * Represents the data structure of the NFT "template_data" mongoDB sub-document
 * @type
 */
export type TemplateDataDocument = {
  cardid?: number;
  name?: string;
  img?: string;
  backimg?: string;
  rarity?: string;
  shine?: string;
  description?: string;
  attack?: number;
  defense?: number;
  class?: string;
  movecost?: number;
  race?: string;
  type?: string;
  element?: string;
  delay?: number;
  difficulty?: number;
  ease?: number;
  luck?: number;
  [key: string]: unknown;
};
/**
 * Represents the data structure of the NFT mongoDB document
 * @type
 */
export type NftDocument = {
  _id?: string;
  miner?: string;
  land_id?: string;
  params?: NftParamsData;
  rand1?: number;
  rand2?: number;
  rand3?: number;
  template_id?: number;
  block_num?: Long;
  block_timestamp?: Date;
  global_sequence?: Long;
  template_data?: TemplateDataDocument;
};

/**
 * @type
 */
export type NftMessageData = {
  miner: string;
  land_id: string;
  params: NftParamsData;
  rand1: number;
  rand2: number;
  rand3: number;
  template_id: number;
  [key: string]: unknown;
};
