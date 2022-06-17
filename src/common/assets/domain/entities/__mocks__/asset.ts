/* eslint-disable @typescript-eslint/no-explicit-any */
export const AssetData = jest.fn(() => ({}));
export const Asset = jest.fn(() => ({}));

(AssetData as any).fromSmartContractsData = jest.fn();
(Asset as any).fromDto = jest.fn();
(Asset as any).create = jest.fn();
