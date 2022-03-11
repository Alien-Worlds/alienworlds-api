import { Message, MessageQueue, QueueHandler } from './messages.types';

/**
 * @abstract
 * @class
 */
export abstract class Messages {
  public static Token = 'MESSAGES';

  public abstract init(): Promise<void>;
  public abstract send(queue: MessageQueue, message: Buffer): Promise<void>;
  public abstract ack(message: Message): void;
  public abstract reject(message: Message): void;
  public abstract consume(queue: MessageQueue, handler: QueueHandler): void;
}
