import { WaxConnectionState } from '@common/state-history/domain/state-history.enums';
import { ConnectionChangeHandler } from './state-history.dtos';

export abstract class StateHistorySource {
  public abstract get isConnected();
  public abstract connect();
  public abstract disconnect();
  public abstract send(message);
  public abstract addConnectionStateHandler(
    state: WaxConnectionState,
    handler: ConnectionChangeHandler
  );
  public abstract onError(handler: (error: Error) => void);
  public abstract onMessage(handler: (dto: Uint8Array) => void);
}
