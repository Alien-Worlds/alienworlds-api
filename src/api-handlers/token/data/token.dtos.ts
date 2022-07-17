/**
 * Represents the available /token request query options
 * @type
 */
export type TokenRequestOptionsDto = {
  type?: 'circulating' | 'supply';
  offset?: number;
  id?: string;
  owner?: string;
  schema?: string;
};
