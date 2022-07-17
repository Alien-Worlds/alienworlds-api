/**
 * Represents the available /asset request query options
 * @type
 */
export type AssetRequestQueryOptionsDto = {
  limit?: number;
  offset?: number;
  id?: string;
  owner?: string;
  schema?: string;
};

/**
 * Represents the data structure of the AssetResult.data object
 * @type
 */
export type AssetResultDataDto = {
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
 * Represents the data structure of the AssetResult object
 * @type
 */
export type AssetResultDto = {
  collection_name: string;
  schema_name: string;
  template_id: number;
  asset_id: number;
  owner: string;
  data: AssetResultDataDto;
};
