/**
 * Represents the available /token request query options
 * @type
 */
export type TokenRequestDto = {
  type?: 'circulating' | 'supply';
  offset?: number;
  id?: string;
  owner?: string;
  schema?: string;
};

export type ContractInterface = {
  balanceOf: (address: string) => Promise<string>;
};
