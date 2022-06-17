export enum WaxConnectionState {
  Connecting = 'connecting',
  Connected = 'connected',
  Idle = 'idle',
  Disconnecting = 'disconnecting',
}

export type ConnectionChangeHandlerOptions = {
  previousState: WaxConnectionState;
  state: WaxConnectionState;
  data: unknown;
};

export type ConnectionChangeHandler = (
  options: ConnectionChangeHandlerOptions
) => void | Promise<void>;

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
