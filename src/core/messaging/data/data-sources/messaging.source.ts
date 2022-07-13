import { Message } from '@core/messaging/domain/entities/message';
import { ConnectionState } from '@core/messaging/domain/messaging.enums';

export type ConnectionStateHandler = (...args: unknown[]) => Promise<void>;

export type MessageHandler = (message: Message) => void;

/**
 * @abstract
 * @class
 */
export abstract class MessagingSource {
  public static Token = 'MESSAGING_SOURCE';

  public abstract addConnectionStateHandler(
    state: ConnectionState,
    handler: ConnectionStateHandler
  ): void;
  public abstract removeConnectionStateHandlers(state?: ConnectionState): void;

  public abstract init(): Promise<void>;
  public abstract send(queue: string, message: Buffer): Promise<void>;
  public abstract ack(message: Message): void;
  public abstract reject(message: Message): void;
  public abstract consume(queue: string, handler: MessageHandler): void;
}
