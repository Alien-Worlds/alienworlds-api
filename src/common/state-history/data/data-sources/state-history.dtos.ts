import { WaxConnectionState } from '@common/state-history/domain/state-history.enums';

export type StateHistoryMessage = {
  this_block: { block_num };
  block: unknown[];
  traces: unknown[];
  deltas: unknown[];
};

export type ConnectionChangeHandlerOptions = {
  previousState: WaxConnectionState;
  state: WaxConnectionState;
  data: unknown;
};

export type ConnectionChangeHandler = (
  options: ConnectionChangeHandlerOptions
) => void | Promise<void>;
