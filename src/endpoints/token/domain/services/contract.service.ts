import { Result } from '@alien-worlds/api-core';
import { injectable } from 'inversify';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class ContractService {
  public abstract getBalance(address: string): Promise<Result<number>>;
}
