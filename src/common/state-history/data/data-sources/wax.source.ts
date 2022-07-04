import WebSocket from 'ws';
import { WaxConnectionState } from '@common/state-history/domain/state-history.enums';
import { Config } from '@config';
import { ConnectionChangeHandler } from './state-history.dtos';
import { StateHistorySource } from './state-history.source';

export class WaxSource implements StateHistorySource {
  private messageHandler;
  private errorHandler;
  private client;
  private connectionState = WaxConnectionState.Idle;
  private connectionChangeHandlers: Map<
    WaxConnectionState,
    ConnectionChangeHandler
  > = new Map();
  private socketIndex = -1;

  constructor(private readonly config: Config) {}

  private async updateConnectionState(
    state: WaxConnectionState,
    data?: unknown
  ) {
    const previousState = state;
    this.connectionState = state;

    const handler = this.connectionChangeHandlers.get(state);

    if (handler) {
      return handler({ previousState, state, data });
    }
  }

  private getNextEndpoint() {
    let nextIndex = ++this.socketIndex;

    if (nextIndex >= this.config.shipEndpoints.length) {
      nextIndex = 0;
    }
    this.socketIndex = nextIndex;

    return this.config.shipEndpoints[this.socketIndex];
  }

  private waitUntilConnectionIsOpen() {
    return new Promise(resolve => this.client.once('open', resolve));
  }

  private waitUntilConnectionIsClosed() {
    return new Promise(resolve => this.client.once('close', resolve));
  }

  private receiveAbi() {
    return new Promise(resolve => this.client.once('message', resolve));
  }

  public onError(handler: (error: Error) => void) {
    this.errorHandler = handler;
  }

  public onMessage(handler: (dto: Uint8Array) => void) {
    this.messageHandler = handler;
  }

  public addConnectionStateHandler(
    state: WaxConnectionState,
    handler: ConnectionChangeHandler
  ) {
    if (this.connectionChangeHandlers.has(state)) {
      console.warn(`Overriding the handler assigned to the "${state}" state`);
    } else {
      this.connectionChangeHandlers.set(state, handler);
    }
  }

  public get isConnected() {
    return this.connectionState === WaxConnectionState.Connected;
  }

  public async connect() {
    if (this.connectionState === WaxConnectionState.Idle) {
      try {
        await this.updateConnectionState(WaxConnectionState.Connecting);
        this.client = new WebSocket(this.getNextEndpoint(), {
          perMessageDeflate: false,
        });
        this.client.on('error', error => this.errorHandler(error));
        await this.waitUntilConnectionIsOpen();
        // receive ABI - first message from WS is always ABI
        const abi = await this.receiveAbi();
        // set message handler
        this.client.on('message', message => this.messageHandler(message));

        await this.updateConnectionState(WaxConnectionState.Connected, abi);
      } catch (error) {
        this.errorHandler(error);
      }
    }
  }

  public async disconnect() {
    if (this.connectionState === WaxConnectionState.Connected) {
      try {
        await this.updateConnectionState(WaxConnectionState.Disconnecting);
        this.client.removeAllListeners();
        this.client.close();
        await this.waitUntilConnectionIsClosed();
        this.client = null;
        await this.updateConnectionState(WaxConnectionState.Idle);
      } catch (error) {
        this.errorHandler(error);
      }
    }
  }

  public send(message: Uint8Array) {
    this.client.send(message);
  }
}
