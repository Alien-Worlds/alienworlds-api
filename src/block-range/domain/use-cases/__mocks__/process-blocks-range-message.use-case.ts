/* eslint-disable @typescript-eslint/no-explicit-any */

export const ProcessBlocksRangeMessageUseCase = jest.fn(() => ({
  execute: jest.fn(),
}));

(ProcessBlocksRangeMessageUseCase as any).Token =
  'PROCESS_BLOCKS_RANGE_MESSAGE_USE_CASE';
