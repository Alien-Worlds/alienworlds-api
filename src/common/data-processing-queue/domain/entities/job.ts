import { Message } from '@core/messaging/domain/entities/message';

/**
 * Represents job entity.
 *
 * @class
 */
export class Job {
  /**
   *
   * @private
   * @constructor
   * @param {Message} message
   */
  protected constructor(public readonly message: Message) {}
}
