export type StateHistoryMessage = {
  this_block: { block_num };
  block: unknown[];
  traces: unknown[];
  deltas: unknown[];
};
