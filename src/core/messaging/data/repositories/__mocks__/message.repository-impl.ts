export const MessageRepositoryImpl = jest.fn(() => ({
  addMessageHandler: handler => {
    handler();
  },
  addMessageToQueue: jest.fn(),
}));
