import Amqp, { Replies } from 'amqplib';

export enum QueueName {
  Action = 'action',
  AlienWorldsBlockRange = 'aw_block_range',
  RecalcAsset = 'recalc_asset',
}

export type QueueCallback = (message: Amqp.ConsumeMessage) => void;

export type QueueListener = {
  queue: string;
  callback: QueueCallback;
};

export class AmqNotInitializedError extends Error {
  constructor() {
    super('Amq not initialized! Run amq.init() first');
  }
}

/**
 * @class
 */
export class Amq {
  private logger: Console;
  private channel: Amqp.ConfirmChannel;
  private connection: Amqp.Connection;
  private initialized: boolean;
  private connectionErrorsCount: number;
  private maxConnectionErrors: number;
  private listeners: QueueListener[];
  private address: string;

  constructor(address: string, logger: Console) {
    this.address = address;
    this.initialized = false;
    this.listeners = [];
    this.connectionErrorsCount = 0;
    this.maxConnectionErrors = 5;
    this.logger = logger;
  }

  /**
   * Connection close handler, reconnect
   */
  private handleConnectionClose() {
    if (this.initialized) {
      this.logger.warn('Connection closed');
      this.initialized = false;
      this.reconnect();
    }
  }

  /**
   * Connection error handler
   *
   * @param {Error} error
   */
  private handleConnectionError(error: Error) {
    if (error.message !== 'Connection closing') {
      if (this.connectionErrorsCount > this.maxConnectionErrors) {
        this.logger.error('Connection Error', { e: error });
      } else {
        this.logger.warn('Connection Error', { e: error });
      }
      this.initialized = false;
      this.reconnect();
    }
  }

  /**
   * Reconnect
   *
   * @private
   * @async
   */
  private async reconnect() {
    if (this.listeners.length && !this.initialized) {
      this.logger.info(`Reloading connection with listeners`);

      try {
        await this.init();
        this.logger.info(`Adding listeners`);
        this.listeners.forEach(({ queue, callback }) =>
          this.listen(queue, callback)
        );
      } catch (e) {
        this.connectionErrorsCount++;
        const retryMs = Math.pow(this.connectionErrorsCount, 2) * 1000;
        setTimeout(() => this.reconnect(), retryMs);
      }
    }
  }

  /**
   * Initialize amqp driver
   *
   * @async
   */
  public async init(): Promise<void> {
    this.connection = await Amqp.connect(this.address);

    this.channel = await this.connection.createConfirmChannel();
    this.channel.assertQueue(QueueName.Action, { durable: true });
    this.channel.assertQueue(QueueName.AlienWorldsBlockRange, {
      durable: true,
    });
    this.channel.assertQueue(QueueName.RecalcAsset, { durable: true });
    this.initialized = true;
    this.connectionErrorsCount = 0;

    this.logger.info(`Connected to AMQ ${this.address}`);

    this.connection.on('error', this.handleConnectionError);
    this.connection.on('close', this.handleConnectionClose);
  }

  /**
   * Send a single message with the content given as a buffer to the specific queue named, bypassing routing.
   *
   * @param {string} queue
   * @param {Buffer} message
   * @param {Function} callback
   */
  public send(
    queue: string,
    message: Buffer,
    callback?: (err: Error, ok: Replies.Empty) => void
  ): void {
    if (!this.initialized) {
      throw new AmqNotInitializedError();
    }
    this.channel.sendToQueue(queue, message, {}, callback);
  }

  /**
   * Set up a listener for the specified queue.
   *
   * @async
   * @param {string} queue - queue name
   * @param {QueueCallback} callback - queue callback
   */
  public async listen(queue: string, callback: QueueCallback): Promise<void> {
    if (!this.initialized) {
      throw new AmqNotInitializedError();
    }
    this.channel.prefetch(1);
    this.listeners.push({ queue, callback });
    this.channel.consume(queue, callback, { noAck: false });
  }

  /**
   * Acknowledge the given message, or all messages up to and including the given message.
   *
   * @param {Amqp.Message} job
   */
  public ack(job): void {
    if (!this.initialized) {
      throw new AmqNotInitializedError();
    }
    try {
      this.channel.ack(job);
    } catch (e) {
      this.logger.error(`Failed to ack job`, e);
    }
  }

  /**
   * Reject a message.
   *
   * @param {Amqp.Message} job
   */
  public reject(job: Amqp.Message): void {
    if (!this.initialized) {
      throw new AmqNotInitializedError();
    }
    try {
      this.channel.reject(job, true);
    } catch (e) {
      this.logger.error(`Failed to reject job`);
    }
  }
}
