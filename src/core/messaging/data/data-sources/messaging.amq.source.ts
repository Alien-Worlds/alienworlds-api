import { log } from '@common/state-history/domain/state-history.utils';
import { Message } from '@core/messaging/domain/entities/message';
import { ConnectionState } from '@core/messaging/domain/messaging.enums';
import { Channel, connect, Connection } from 'amqplib';
import { wait } from '../messaging.utils';

import {
  ConnectionStateHandler,
  MessageHandler,
  MessagingSource,
} from './messaging.source';

export type QueueOptions = {
  name: string;
  options: object;
};

export type ChannelOptions = {
  prefetch: number;
  queues: QueueOptions[];
};

/**
 * @class
 */
export class MessagingAmqSource implements MessagingSource {
  private logger: Console;
  private channel: Channel;
  private connection: Connection;
  private connectionErrorsCount: number;
  private maxConnectionErrors: number;
  private handlers: Map<string, MessageHandler[]>;
  private connectionStateHandlers: Map<ConnectionState, ConnectionStateHandler>;
  private address: string;
  private initialized: boolean;
  private connectionState: ConnectionState;
  private connectionError: unknown;
  private channelOptions: ChannelOptions;

  /**
   * @constructor
   * @param {string} address - connection string
   * @param {ChannelOptions} channelOptions - channel options
   * @param {Console} logger - logger instance
   */
  constructor(
    address: string,
    channelOptions: ChannelOptions,
    logger: Console
  ) {
    this.address = address;
    this.initialized = false;
    this.handlers = new Map<string, MessageHandler[]>();
    this.connectionStateHandlers = new Map<
      ConnectionState,
      ConnectionStateHandler
    >();
    this.connectionErrorsCount = 0;
    this.connectionState = ConnectionState.Offline;
    this.maxConnectionErrors = 5;
    this.logger = logger;
    this.channelOptions = channelOptions;
  }

  /**
   * Reconnect to server
   *
   * This function is called when the connection is closed.
   *
   * @private
   * @async
   */
  private async handleConnectionClose(): Promise<void> {
    if (this.connectionState === ConnectionState.Closing) {
      this.connectionState = ConnectionState.Offline;
      this.logger.warn('Connection closed');

      if (this.connectionStateHandlers.has(ConnectionState.Offline)) {
        await this.connectionStateHandlers.get(ConnectionState.Offline)();
      }

      await this.reconnect();
    }
  }

  /**
   * Logs a connection error and tries to reconnect.
   * This function is called when there is a connection error.
   *
   * @private
   * @async
   * @param {Error} error
   */
  private async handleConnectionError(error: Error): Promise<void> {
    if (error.message !== 'Connection closing') {
      this.connectionErrorsCount++;
      if (this.connectionErrorsCount > this.maxConnectionErrors) {
        this.logger.error('Connection Error', { e: error });
      } else {
        this.logger.warn('Connection Error', { e: error });
      }
    }
  }

  private handleChannelCancel(reason) {
    if (this.connectionState === ConnectionState.Online) {
      this.close(reason);
    }
  }

  private handleChannelClose() {
    if (this.connectionState === ConnectionState.Online) {
      this.close();
    }
  }

  private handleChannelError(error) {
    if (this.connectionState === ConnectionState.Online) {
      this.close(error);
    }
  }

  /**
   * Reconnect to server and reassign queue handlers.
   * This function is called when the connection is lost
   * due to an error or closure.
   *
   * After a failed connection attempt, the function calls
   * itself after a specified time.
   *
   * @private
   * @async
   */
  private async reconnect() {
    if (this.connectionState === ConnectionState.Offline) {
      this.initialized = false;
      log(`Reloading connection with handlers`);

      try {
        await this.init();
        await this.reassignHandlers();
      } catch (error) {
        this.connectionState = ConnectionState.Offline;
        this.connectionErrorsCount++;
        const ms = Math.pow(this.connectionErrorsCount, 2) * 1000;
        await this.waitAndReconnect(ms);
      }
    }
  }

  /**
   * Wait for the specified time and reconnect.
   * (Written to facilitate unit testing)
   *
   * @param {number} ms
   */
  private async waitAndReconnect(ms: number) {
    await wait(ms);
    await this.reconnect();
  }

  /**
   * Reassign queue handlers stored in the 'handlers' map.
   * This function is called when the connection is restored
   *
   * @private
   * @async
   */
  private async reassignHandlers(): Promise<void> {
    const promises = [];
    this.handlers.forEach((handlers: MessageHandler[], queue: string) => {
      handlers.forEach(handler =>
        promises.push(
          this.channel.consume(queue, dto => handler(Message.fromDto(dto)), {
            noAck: false,
          })
        )
      );
    });
    await Promise.all(promises);
  }

  /**
   * Create channel and set up queues.
   *
   * @private
   * @async
   */
  private async createChannel(): Promise<void> {
    const { prefetch, queues } = this.channelOptions;
    this.channel = await this.connection.createChannel();
    this.channel.on('cancel', data => this.handleChannelCancel(data));
    this.channel.on('close', () => this.handleChannelClose());
    this.channel.on('error', error => this.handleChannelError(error));
    log(`Channel created.`);

    await this.channel.prefetch(prefetch);
    for (const queue of queues) {
      await this.channel.assertQueue(queue.name, queue.options);
    }

    log(`Queues set up.`);
  }

  /**
   * Connect to server
   *
   * @private
   * @async
   */
  private async connect(): Promise<void> {
    if (this.connectionState !== ConnectionState.Offline) {
      return;
    }
    this.connectionState = ConnectionState.Connecting;
    this.connection = await connect(this.address);
    this.connection.on('error', error => this.handleConnectionError(error));
    this.connection.on('close', () => this.handleConnectionClose());
    this.connectionState = ConnectionState.Online;

    log(`Connected to AMQ ${this.address}`);
  }

  /**
   * Close connection
   *
   * @param {unknown} reason
   */
  public async close(reason?: unknown): Promise<void> {
    if (this.connectionState === ConnectionState.Online) {
      this.connectionState = ConnectionState.Closing;
      if (reason) {
        this.connectionError = reason;
      }
      await this.connection.close();

      log(`Disconnected from AMQ ${this.address}`);
    }
  }

  /**
   * Initialize driver
   *
   * @async
   */
  public async init(): Promise<void> {
    if (!this.initialized) {
      await this.connect();
      await this.createChannel();

      this.initialized = true;
      this.connectionErrorsCount = 0;
    }
  }

  /**
   * Returns the current queue statistics
   *
   * @param {string} queueName
   * @returns {} Object
   *  {
   *    queue: string,
   *    messageCount: number,
   *    consumerCount: number
   *  }
   */
  async getQueueStats(queueName: string) {
    const queue = this.channelOptions.queues.find(
      queue => queue.name === queueName
    );
    if (queue) {
      return this.channel.assertQueue(queue.name, queue.options);
    }

    throw new Error(`Unknown queue ${queue}`);
  }

  /**
   * Send a single message with the content given as a buffer to the specific queue named, bypassing routing.
   *
   * @async
   * @param {string} queue
   * @param {Buffer} message
   */
  public async send(queue: string, message: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const success = this.channel.sendToQueue(queue, message, {
        deliveryMode: true,
      });
      return success ? resolve() : reject();
    });
  }
  /**
   * Set up a listener for the queue.
   *
   * @param {string} queue - queue name
   * @param {MessageHandler} handler - queue handler
   */
  public consume(queue: string, handler: MessageHandler): void {
    try {
      if (this.handlers.has(queue)) {
        this.handlers.get(queue).push(handler);
      } else {
        this.handlers.set(queue, [handler]);
      }
      this.channel.consume(queue, dto => handler(Message.fromDto(dto)), {
        noAck: false,
      });
    } catch (error) {
      this.logger.error(`Failed to add listener`, error);
    }
  }

  /**
   * Acknowledge the message.
   *
   * @param {Message} message
   */
  public ack(message: Message): void {
    try {
      this.channel.ack(message.toDto());
    } catch (error) {
      this.logger.error(`Failed to ack message`, error);
    }
  }

  /**
   * Reject a message.
   * Negative acknowledgement - set a message as not delivered and should be discarded.
   *
   * @param {Message} message
   */
  public reject(message: Message): void {
    try {
      this.channel.reject(message.toDto(), true);
    } catch (error) {
      this.logger.error(`Failed to reject message`, error);
    }
  }

  /**
   *
   * @param {ConnectionState} state
   * @param {ConnectionStateHandler} handler
   */
  public addConnectionStateHandler(
    state: ConnectionState,
    handler: ConnectionStateHandler
  ): void {
    if (this.connectionStateHandlers.has(state)) {
      this.logger.warn(`Overwriting connection state: ${state} handler`);
    }
    this.connectionStateHandlers.set(state, handler);
  }

  /**
   *
   * @param {ConnectionState} state
   */
  public removeConnectionStateHandlers(state?: ConnectionState): void {
    if (state) {
      this.connectionStateHandlers.delete(state);
    } else {
      this.connectionStateHandlers.clear();
    }
  }
}
