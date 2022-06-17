/* eslint-disable @typescript-eslint/no-explicit-any */
export const ActionMessage = jest.fn(() => ({}));

(ActionMessage as any).fromMessage = jest.fn();
