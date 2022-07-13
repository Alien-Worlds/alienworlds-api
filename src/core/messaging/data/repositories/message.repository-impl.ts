/* eslint-disable @typescript-eslint/no-unused-vars */
import { Message } from '../../domain/entities/message';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { InvalidMessageQueueError } from '../../domain/errors/invalid-message-queue.error';
import { MessageRepository } from '../../domain/repositories/message.repository';
import {
  MessageHandler,
  MessagingSource,
} from '../data-sources/messaging.source';

/**
 * Represents the base for messages repositories
 *
 * @class
 */
export class MessageRepositoryImpl implements MessageRepository {
  protected cache: Map<string, Message> = new Map();

  /**
   * @constructor
   * @param {MessagingSource} messageSource
   */
  constructor(
    protected messageSource: MessagingSource,
    protected queue: string
  ) {}

  /**
   * Send message
   *
   * Queue is optional as this method is overridden in specific
   * messages repositories.
   *
   * @async
   * @param {Buffer} message
   * @returns {Result<void>}
   */
  public async queueMessage(message: Buffer): Promise<Result<void>> {
    if (!this.queue) {
      return Result.withFailure(
        Failure.fromError(new InvalidMessageQueueError(this.queue))
      );
    }
    try {
      await this.messageSource.send(this.queue, message);
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Ack message
   *
   * @param {Message} message
   * @returns {Result<void>}
   */
  public ack(message: Message): Result<void> {
    try {
      this.messageSource.ack(message);
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Reject message
   *
   * @param {Message} message
   * @returns {Result<void>}
   */
  public reject(message: Message): Result<void> {
    try {
      this.messageSource.reject(message);
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Add message handler.
   *
   * Queue is optional as this method is overridden in specific
   * messages repositories.
   *
   * @param {MessageHandler} handler
   * @returns {Result<void>}
   */
  public addMessageHandler(handler: MessageHandler): Result<void> {
    try {
      this.messageSource.consume(this.queue, handler);
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
