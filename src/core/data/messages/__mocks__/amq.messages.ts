export const AmqMessages = jest.fn(() => ({
  send: jest.fn(),
  ack: jest.fn(),
  addListener: jest.fn(),
  init: jest.fn(),
}));
