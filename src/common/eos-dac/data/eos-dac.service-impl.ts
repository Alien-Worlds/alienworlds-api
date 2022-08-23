import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import fetch, { RequestInit } from 'node-fetch';
import { config } from '../../../config';
import { RequestError } from '../../../core/architecture/data/errors/request.error';
import { CurrencyStats } from '../domain/entities/currecy-stats';
import { EosDacInfo } from '../domain/entities/eos-dac-info';
import { EosDacInfoDto, CurrencyStatsDto } from './eos-dac.dtos';

/**
 * Represents the service responsible for communication with eosDAC
 *
 * @class
 */
export class EosDacServiceImpl {
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
   * @returns {EosDacInfo}
   */
  public async getInfo(): Promise<Result<EosDacInfo>> {
    try {
      const dto = await this.sendRequest<EosDacInfoDto>(
        `${config.endpoints[0]}/v1/chain/get_info`
      );
      return Result.withContent(EosDacInfo.fromDto(dto));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Get the currency stats
   *
   * @async
   * @returns {Promise<CurrencyStats>}
   */
  public async getCurrencyStats(): Promise<Result<CurrencyStats>> {
    try {
      const options: RequestInit = {
        method: 'POST',
        body: JSON.stringify({
          json: true,
          code: 'alien.worlds',
          symbol: 'TLM',
        }),
        headers: { 'Content-Type': 'application/json' },
      };
      const dto = await this.sendRequest<CurrencyStatsDto>(
        `${config.endpoints[0]}/v1/chain/get_currency_stats`,
        options
      );
      return Result.withContent(CurrencyStats.fromDto(dto));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Get the account currency balance
   *
   * @async
   * @param {string} account
   * @returns {Promise<Result<number>>}
   */
  public async getCurrencyBalance(account: string): Promise<Result<number>> {
    try {
      const options: RequestInit = {
        method: 'POST',
        body: JSON.stringify({
          account,
          code: 'alien.worlds',
          symbol: 'TLM',
        }),
        headers: { 'Content-Type': 'application/json' },
      };
      const dto = await this.sendRequest(
        `${config.endpoints[0]}/v1/chain/get_currency_balance`,
        options
      );

      // map dto to float number
      const [balance] = dto[0].split(' ');
      return Result.withContent(parseFloat(balance));
    } catch (error) {
      // TODO: Should we log errors?
      return Result.withContent(0);
    }
  }
}
