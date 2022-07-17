import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class BinanceSmartChainService {
  public static Token = 'BINANCE_SMART_CHAIN_SERVICE';

  public abstract balanceOf(address: string): Result<number>;
}
