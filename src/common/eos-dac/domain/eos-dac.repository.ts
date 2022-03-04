import { Failure } from '../../../core/domain/failure';
import { CurrencyStats } from './entities/currecy-stats';
import { EosDacInfo } from './entities/eos-dac-info';

/**
 * @abstract
 */
export abstract class EosDacRepository {
  public static Token = 'EOS_DAC_REPOSITORY';

  public abstract getInfo(): Promise<EosDacInfo | Failure>;
  public abstract getCurrecyStats(): Promise<CurrencyStats | Failure>;
  public abstract getCurrencyBalance(account: string): Promise<number>;
}
