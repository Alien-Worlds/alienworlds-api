/* eslint-disable @typescript-eslint/no-explicit-any */
export const RecalcAssetMessage = jest.fn(() => ({}));

(RecalcAssetMessage as any).fromMessage = jest.fn();
