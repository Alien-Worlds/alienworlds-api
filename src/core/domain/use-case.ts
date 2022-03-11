/* istanbul ignore file */

import { injectable } from 'inversify';
import { Result } from './result';

/**
 * @abstract
 * @class
 */
// @injectable()
export abstract class UseCase<T = unknown> {
  public abstract execute(...rest: unknown[]): Promise<Result<T>> | Result<T>;
}
