import { Long } from 'mongodb';

/**
 * Represents the data structure of the Asset.data.immutable_serialized_data sub document
 * @type
 */
export type AssetSerializedDataSubDocument = {
  cardid: number;
  name: string;
  img: string;
  backimg: string;
  rarity: string;
  shine: string;
  type: string;
  delay: number;
  difficulty: number;
  ease: number;
  luck: number;
};

/**
 * Represents the data structure of the Asset.data sub document
 * @type
 */
export type AssetDataSubDocument = {
  collection_name: string;
  schema_name: string;
  template_id: number;
  immutable_serialized_data: AssetSerializedDataSubDocument;
};

/**
 * Represents the data structure of the Asset mongoDB document
 * @type
 */
export type AssetDocument = {
  _id?: string;
  asset_id: Long;
  owner: string;
  data: AssetDataSubDocument;
};
