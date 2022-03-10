import { Result } from '@core/domain/result';
import { CurrencyStats } from './entities/currecy-stats';
import { EosDacInfo } from './entities/eos-dac-info';

/**
 * @abstract
 */
export abstract class EosDacRepository {
  public static Token = 'EOS_DAC_REPOSITORY';

  public abstract getInfo(): Promise<Result<EosDacInfo>>;
  public abstract getCurrecyStats(): Promise<Result<CurrencyStats>>;
  public abstract getCurrencyBalance(account: string): Promise<Result<number>>;
}
