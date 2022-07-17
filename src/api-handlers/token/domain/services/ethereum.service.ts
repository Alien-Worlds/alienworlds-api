import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class EthereumService {
  public static Token = 'ETHEREUM_SERVICE';

  public abstract balanceOf(address: string): Result<number>;
}
