/* eslint-disable @typescript-eslint/no-explicit-any */

export const DeserializeActionUseCase = jest.fn(() => ({
  execute: jest.fn(),
}));

(DeserializeActionUseCase as any).Token = 'DESERIALIZE_ACTION_USE_CASE';
