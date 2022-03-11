/* eslint-disable @typescript-eslint/no-explicit-any */

export const SetupStateReceiverUseCase = jest.fn(() => ({
  execute: jest.fn(),
}));

(SetupStateReceiverUseCase as any).Token = 'SETUP_STATE_RECEIVER_USE_CASE';
