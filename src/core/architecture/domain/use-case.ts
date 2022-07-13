/* istanbul ignore file */
import { Result } from './result';

/**
 * @abstract
 * @class
 */
export abstract class UseCase<T = unknown> {
  public abstract execute(
    ...rest: unknown[]
  ): Promise<Result<T>> | Result<T> | void;
}
