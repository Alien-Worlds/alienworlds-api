import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { CurrencyStats } from './entities/currecy-stats';
import { EosDacInfo } from './entities/eos-dac-info';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class EosDacService {
  public static Token = 'EOS_DAC_SERVICE';

  public abstract getInfo(): Promise<Result<EosDacInfo>>;
  public abstract getCurrencyStats(): Promise<Result<CurrencyStats>>;
  public abstract getCurrencyBalance(account: string): Promise<Result<number>>;
}
