/* eslint-disable @typescript-eslint/no-empty-function */
export const StateReceiver = jest.fn(() => {
  let doneHandler;

  return {
    parseDate: jest.fn(),
    registerBlockHandler: jest.fn(),
    registerDoneHandler: handler => {
      doneHandler = handler;
    },
    registerTraceHandler: jest.fn(),
    registerDeltaHandler: jest.fn(),
    registerProgressHandler: jest.fn(),
    registerForkHandler: jest.fn(),
    registerConnectedHandler: jest.fn(),
    status: jest.fn(),
    start: jest.fn(),
    restart: jest.fn(),
    destroy: jest.fn(),
    requestBlocks: jest.fn(),
    handleFork: jest.fn(),
    receivedBlock: jest.fn(),
    __triggerRegisterDoneHandler: () => doneHandler(),
  };
});
