import { Result } from '@core/domain/result';
import { UseCase } from '@core/domain/use-case';
import { injectable } from 'inversify';

@injectable()
export class SetupStateReceiverUseCase extends UseCase {
  public static Token = 'SETUP_STATE_RECEIVER_USE_CASE';

  public execute() {
    return Result.withContent({
      start: () => {
        //
      },
    });
  }
}
