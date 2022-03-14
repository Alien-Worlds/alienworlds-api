import { MessageHandler, MessageQueue, Messages } from '@core/domain/messages';
import { ConfirmChannel, connect, Connection, Message } from 'amqplib';

/**
 * Suspends execution of the current process for a given number of milliseconds
 * @async
 * @param {number} ms
 * @returns {Promise}
 */
export const wait = async (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * @class
 */
export class AmqMessages implements Messages {
  private logger: Console;
  private channel: ConfirmChannel;
  private connection: Connection;
  private connectionErrorsCount: number;
  private maxConnectionErrors: number;
  private handlers: Map<string, MessageHandler>;
  private address: string;
  private initialized: boolean;

  /**
   * @constructor
   * @param {string} address - connection string
   * @param {Console} logger - logger instance
   */
  constructor(address: string, logger: Console) {
    this.address = address;
    this.initialized = false;
    this.handlers = new Map<string, MessageHandler>();
    this.connectionErrorsCount = 0;
    this.maxConnectionErrors = 5;
    this.logger = logger;
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
    this.logger.warn('Connection closed');
    await this.reconnect();
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
      await this.reconnect();
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
    this.initialized = false;
    this.logger.info(`Reloading connection with handlers`);

    try {
      await this.init();
      await this.reassignHandlers();
    } catch (error) {
      this.connectionErrorsCount++;
      const retryMs = Math.pow(this.connectionErrorsCount, 2) * 1000;
      await wait(retryMs);
      await this.reconnect();
    }
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
    this.handlers.forEach((callback: MessageHandler, queue: string) =>
      promises.push(this.channel.consume(queue, callback, { noAck: false }))
    );
    await Promise.all(promises);
  }

  /**
   * Create channel and set up queues.
   *
   * @private
   * @async
   */
  private async createChannel(): Promise<void> {
    this.channel = await this.connection.createConfirmChannel();
    this.logger.info(`Channel created.`);

    await this.channel.prefetch(1);
    await this.channel.assertQueue(MessageQueue.Action, { durable: true });
    await this.channel.assertQueue(MessageQueue.AlienWorldsBlockRange, {
      durable: true,
    });
    await this.channel.assertQueue(MessageQueue.RecalcAsset, { durable: true });

    this.logger.info(`Queues set up.`);
  }

  /**
   * Connect to server
   *
   * @private
   * @async
   */
  private async connect(): Promise<void> {
    this.connection = await connect(this.address);
    this.connection.on('error', error => this.handleConnectionError(error));
    this.connection.on('close', () => this.handleConnectionClose());

    this.logger.info(`Connected to AMQ ${this.address}`);
  }

  /**
   * Initialize driver
   *
   * @async
   */
  public async init(): Promise<void> {
    await this.connect();
    await this.createChannel();

    this.initialized = true;
    this.connectionErrorsCount = 0;
  }
  /**
   * Send a single message with the content given as a buffer to the specific queue named, bypassing routing.
   *
   * @async
   * @param {string} queue
   * @param {Buffer} message
   */
  public async send(queue: MessageQueue, message: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      this.channel.sendToQueue(queue, message, {}, error =>
        error ? reject(error) : resolve()
      );
    });
  }
  /**
   * Set up a listener for the queue.
   *
   * @param {string} queue - queue name
   * @param {MessageHandler} handler - queue handler
   */
  public consume(queue: MessageQueue, handler: MessageHandler): void {
    try {
      if (this.handlers.has(queue)) {
        this.logger.warn(
          'The listener is already assigned, the current handler will be replaced with the new one'
        );
      }
      this.handlers.set(queue, handler);
      this.channel.consume(queue, handler, { noAck: false });
    } catch (error) {
      this.logger.error(`Failed to add listener`, error);
    }
  }

  /**
   * Positive acknowledgements - record a message as delivered and can be discarded.
   *
   * @param {Message} message
   */
  public ack(message: Message): void {
    try {
      this.channel.ack(message);
    } catch (error) {
      this.logger.error(`Failed to ack message`, error);
    }
  }

  /**
   * Reject a message.
   * Negative acknowledgements - record a message as not delivered and should be discarded.
   *
   * @param {Message} message
   */
  public reject(message: Message): void {
    try {
      this.channel.reject(message, true);
    } catch (error) {
      this.logger.error(`Failed to reject message`, error);
    }
  }
}
