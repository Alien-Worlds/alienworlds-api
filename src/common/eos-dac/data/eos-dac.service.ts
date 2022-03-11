import { injectable } from 'inversify';
import { config } from '../../../config';
import { RequestError } from '../../../core/errors/request.error';
import { EosDacInfoDto, CurrencyStatsDto } from './eos-dac.dtos';

/**
 * Represents the service responsible for communication with eosDAC
 *
 * @class
 */
@injectable()
export class EosDacService {
  public static Token = 'EOS_DAC_SERVICE';

  /**
   * Send the request
   *
   * @async
   * @private
   * @param {string} url
   * @param {RequestInit=} options
   * @returns {Promise<T>}
   */
  private async sendRequest<T = unknown>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    }
    const { status, statusText } = response;
    throw new RequestError(status, statusText, json);
  }

  /**
   * Get blockchain information
   *
   * @async
   * @returns {EosDacInfoDto}
   */
  public async getInfo(): Promise<EosDacInfoDto> {
    return this.sendRequest(`${config.endpoints[0]}/v1/chain/get_info`);
  }

  /**
   * Get the currency stats
   *
   * @async
   * @returns {Promise<CurrencyStatsDto>}
   */
  public async getCurrencyStats(): Promise<CurrencyStatsDto> {
    const options: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        json: true,
        code: 'alien.worlds',
        symbol: 'TLM',
      }),
      headers: { 'Content-Type': 'application/json' },
    };
    return this.sendRequest(
      `${config.endpoints[0]}/v1/chain/get_currency_stats`,
      options
    );
  }

  /**
   * Get the account currency balance
   *
   * @async
   * @param {string} account
   * @returns {Promise<string[]>}
   */
  public async getCurrencyBalance(account: string): Promise<string[]> {
    const options: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        account,
        code: 'alien.worlds',
        symbol: 'TLM',
      }),
      headers: { 'Content-Type': 'application/json' },
    };
    return this.sendRequest(
      `${config.endpoints[0]}/v1/chain/get_currency_balance`,
      options
    );
  }
}
