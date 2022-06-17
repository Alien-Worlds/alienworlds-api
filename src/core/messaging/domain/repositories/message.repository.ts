import { MessageHandler } from '../../data/data-sources/messaging.source';
import { injectable } from 'inversify';
import { Message } from '../entities/message';
import { Result } from '@core/architecture/domain/result';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class MessageRepository {
  public static Token = 'MESSAGE_REPOSITORY';
  // producer methods
  public abstract queueMessage(message: Buffer): Promise<Result<void>>;
  // consumer methods
  public abstract ack(message: Message): Result<void>;
  public abstract reject(message: Message): Result<void>;
  public abstract addMessageHandler(handler: MessageHandler): Result<void>;
}
