import { MessageDto } from '../../data/messaging.dtos';
import { MissingMessageIdError } from '../errors/missing-message-id.error';
import { MessageFields, MessageProperties } from 'amqplib';

export class Message {
  /**
   * @private
   * @constructor
   * @param {string} id
   * @param {Buffer} content
   */
  private constructor(
    public readonly id: string,
    public readonly content: Buffer,
    private readonly fields: MessageFields,
    private readonly properties: MessageProperties
  ) {}

  /**
   * Get DTO from Message entity
   * @returns
   */
  public toDto(): MessageDto {
    const { content, properties, fields } = this;
    return {
      content,
      fields,
      properties,
    };
  }

  /**
   * Create Message instance based on DTO.
   *
   * @static
   * @param {MessageDto} dto
   */
  public static fromDto(dto: MessageDto): Message {
    const { content, fields, properties } = dto;

    if (!properties || !properties.messageId) {
      throw new MissingMessageIdError();
    }

    return new Message(properties.messageId, content, fields, properties);
  }
}
