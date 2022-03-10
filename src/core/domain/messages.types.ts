/* istanbul ignore file */

export enum MessageQueue {
  Action = 'action',
  AlienWorldsBlockRange = 'aw_block_range',
  RecalcAsset = 'recalc_asset',
}

export type QueueHandler = (message: unknown) => void;

export interface Message {
  content: Buffer;
  fields?: unknown;
  properties?: unknown;
}
