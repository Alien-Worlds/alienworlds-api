/**
 * Represents the data structure of the asset data
 * smart contract table row. Received from EOS JsonRpc
 *
 * @type
 */
export type AssetSmartContractTableRow = {
  collection_name: string;
  schema_name: string;
  template_id: string;
  [key: string]: unknown;
};

/**
 * Represents the data structure of the template table row.
 * Received from EOS JsonRpc
 *
 * @type
 */
export type TemplateSmartContractTableRow = {
  schema_name: string;
  immutable_serialized_data: Uint8Array;
  [key: string]: unknown;
};

/**
 * Represents the data structure of the template schema table row.
 * Received from EOS JsonRpc
 *
 * @type
 */
export type SchemaSmartContractTableRow = {
  format: SchemaFormat;
  [key: string]: unknown;
};

/**
 * Represents the data structure of the schema format.
 *
 * @type
 */
export type SchemaFormat = {
  name: string;
  type: string;
  parent?: number;
  [key: string]: unknown;
}[];
