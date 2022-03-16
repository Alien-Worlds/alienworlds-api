import abieos from '@eosrio/node-abieos';
import { injectable } from 'inversify';

/**
 * Represents the service responsible for converting
 * Binary to/from JSON using Abieos library.
 *
 * @see {@link https://github.com/EOSIO/abieos} for more details
 * @see {@link https://github.com/eosrio/node-abieos}
 *
 * @class
 */
@injectable()
export class AbieosService {
  public static Token = 'ABIEOS_SERVICE';
  /**
   * Set abi hex format.
   *
   * @param {string} account
   * @param {string} abiHex
   */
  public loadAbiHex(account: string, abiHex: string): void {
    abieos.load_abi_hex(account, abiHex);
  }
  /**
   * Get the type name for an action.
   *
   * @param {string} account
   * @param {string} action
   * @returns {string}
   */
  public getTypeForAction(account: string, action: string): string {
    return abieos.get_type_for_action(account, action);
  }
  /**
   * Get the type name for a table.
   *
   * @param {string} account
   * @param {string} table
   * @returns {string}
   */
  public getTypeForTable(account: string, table: string): string {
    return abieos.get_type_for_table(account, table);
  }
  /**
   * Convert binary to JSON
   *
   * @param {string} account
   * @param {string} type
   * @param {Buffer} buffer
   * @returns {string}
   */
  public parseDataToJson(
    account: string,
    type: string,
    buffer: Buffer
  ): string {
    return abieos.bin_to_json(account, type, buffer);
  }
}
