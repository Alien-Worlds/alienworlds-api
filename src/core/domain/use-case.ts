import { injectable } from 'inversify';
import { Failure } from './failure';
import { Result } from './result';

@injectable()
export abstract class UseCase<T = unknown> {
  public abstract execute(
    ...rest: unknown[]
  ): Promise<Result<T | Failure>> | Result<T | Failure>;
}
