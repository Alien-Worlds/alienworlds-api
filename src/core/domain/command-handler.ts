/* istanbul ignore file */
import { injectable } from 'inversify';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class CommandHandler {
  public abstract run(...rest: unknown[]): void | Promise<void>;
}
