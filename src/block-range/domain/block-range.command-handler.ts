import { Message, MessageQueue, Messages } from '@core/domain/messages';
import { inject, injectable } from 'inversify';
import { CommandHandler } from '../../core/domain/command-handler';
import { ProcessBlocksRangeMessageUseCase } from './use-cases/process-blocks-range-message.use-case';

/**
 * @class
 */
@injectable()
export class BlockRangeCommandHandler extends CommandHandler {
  public static Token = 'BLOCK_RANGE_COMMAND_HANDLER';

  @inject(ProcessBlocksRangeMessageUseCase.Token)
  private processBlockRangeMessageUseCase: ProcessBlocksRangeMessageUseCase;

  @inject(Messages.Token)
  private messages: Messages;

  /**
   * Set up a consumer for the "aw_block_range" messages
   * with a callback to be invoked with each message
   * and proccess block range.
   *
   */
  public run() {
    this.messages.consume(
      MessageQueue.AlienWorldsBlockRange,
      (message: Message) => {
        this.processBlockRangeMessageUseCase.execute(message);
      }
    );
  }
}
