import { Result } from '@alien-worlds/api-core';
import { injectable } from '@alien-worlds/api-core';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class ContractService {
  public abstract getBalance(address: string): Promise<Result<number>>;
}
