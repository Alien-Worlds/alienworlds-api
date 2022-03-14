import { Message, MessageQueue } from '@core/domain/messages';

export const AmqMessages = jest.fn(() => {
  const handlers = new Map();
  return {
    send: jest.fn(),
    ack: jest.fn(),
    addListener: jest.fn(),
    init: jest.fn(),
    consume: (message: Message, handler: () => void) => {
      handlers.set(message, handler);
    },
    __triggerMessageHandler: (message: MessageQueue) => {
      const handler = handlers.get(message);
      if (handler) {
        handler();
      }
    },
  };
});
