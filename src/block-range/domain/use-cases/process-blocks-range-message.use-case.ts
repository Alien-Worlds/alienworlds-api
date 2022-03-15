import { Message } from '@core/domain/messages';
import { inject, injectable } from 'inversify';
import { Result } from '../../../core/domain/result';
import { UseCase } from '../../../core/domain/use-case';
import { SetupStateReceiverUseCase } from './setup-state-receiver.use-case';

/**
 * @class
 */
@injectable()
export class ProcessBlocksRangeMessageUseCase implements UseCase {
  public static Token = 'PROCESS_BLOCKS_RANGE_MESSAGE_USE_CASE';

  /**
   * @constructor
   * @param {Messages} messages
   * @param {(startBlock, endBlock) => StateReceiver} stateReceiverFactory
   */
  constructor(
    @inject(SetupStateReceiverUseCase.Token)
    private setupStateReceiverUseCase: SetupStateReceiverUseCase
  ) {}

  /**
   * Initializes and runs a eosDAC StateReceiver.
   *
   * @param {Message} message
   */
  public execute(message: Message) {
    console.log(`Received job`);

    const { content: stateReceiver, failure } =
      this.setupStateReceiverUseCase.execute(message);

    if (failure) {
      return Result.withFailure(failure);
    }

    stateReceiver.start();

    return Result.withoutContent();
  }
}
