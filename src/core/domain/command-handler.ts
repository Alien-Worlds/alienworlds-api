import { injectable } from 'inversify';

@injectable()
export abstract class CommandHandler {
  public abstract run(...rest: unknown[]): Promise<void>;
}
