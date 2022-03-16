import { Message, MessageQueue, Messages } from '@core/domain/messages';
import { inject, injectable } from 'inversify';
import { CommandHandler } from '../../core/domain/command-handler';

/**
 * @class
 */
@injectable()
export class ProcessorCommandHandler extends CommandHandler {
  public static Token = 'PROCESSOR_COMMAND_HANDLER';

  @inject(Messages.Token)
  private messages: Messages;

  /**
   *
   */
  public run() {
    //
  }
}
