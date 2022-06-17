import { MissingMessageIdError } from '../../errors/missing-message-id.error';
import { Message } from '../message';

const dto = {
  content: Buffer.from([]),
  fields: {},
  properties: { messageId: 'messageId' },
};

describe('Message instance Unit tests', () => {
  it('"fromDto" should create entity from dto', () => {
    const entity = Message.fromDto(dto as any);
    expect(entity).toBeInstanceOf(Message);
  });

  it('"fromDto" should throw an error if messageId is missing', () => {
    try {
      dto.properties.messageId = null;
      Message.fromDto(dto as any);
    } catch (error) {
      expect(error).toBeInstanceOf(MissingMessageIdError);
    }
  });

  it('"toDto" should a dto from the entity', () => {
    dto.properties.messageId = 'messageId';
    const entity = Message.fromDto(dto as any);
    expect(entity.toDto()).toEqual(dto);
  });
});
