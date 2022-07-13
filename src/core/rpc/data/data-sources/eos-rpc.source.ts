/**
 * JsonRpc request options
 * @type
 */
export type GetTableRowsOptions = {
  json?: unknown;
  code?: string;
  scope?: string;
  table?: string;
  lower_bound?: unknown;
  upper_bound?: unknown;
  index_position?: number;
  key_type?: unknown;
  limit?: number;
  reverse?: unknown;
  show_payer?: unknown;
};

/**
 * It is the interface for eos JsonRpc.
 * Implementations and binding can be found in the ioc config files (ioc.config.ts).
 *
 * @abstract
 * @class
 */
export abstract class EosRpcSource {
  public static Token: 'EOS_RPC_SOURCE';

  /**
   * Get the data rows based on the given options.
   *
   * @abstract
   * @async
   * @param {GetTableRowsOptions} options
   */
  public abstract getTableRows<T>(options: GetTableRowsOptions): Promise<T[]>;
}
