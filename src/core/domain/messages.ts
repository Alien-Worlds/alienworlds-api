import * as Amq from 'amqplib';

export type Message = Amq.Message;

export enum MessageQueue {
  Action = 'action',
  AlienWorldsBlockRange = 'aw_block_range',
  RecalcAsset = 'recalc_asset',
}

export type MessageHandler = (message: Message) => void;

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
  public abstract consume(queue: MessageQueue, handler: MessageHandler): void;
}
