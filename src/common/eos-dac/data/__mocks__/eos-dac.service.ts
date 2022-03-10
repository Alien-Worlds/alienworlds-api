/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable } from 'inversify';
import { CurrencyStatsDto, EosDacInfoDto } from '../eos-dac.dtos';

@injectable()
export class EosDacService {
  public static Token = 'EOS_DAC_SERVICE';

  public async getInfo(): Promise<EosDacInfoDto> {
    return null;
  }

  public async getCurrencyStats(): Promise<CurrencyStatsDto> {
    return null;
  }

  public async getCurrencyBalance(account: string): Promise<string[]> {
    return [];
  }
}
