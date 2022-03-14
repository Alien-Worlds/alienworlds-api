/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

import { Config } from '../config';
import { StatsDisplay } from '../include/statsdisplay';
import fetch from 'node-fetch';
import { MessageQueue, Messages } from '@core/domain/messages';

const { Api, JsonRpc, Serialize } = require('eosjs');

export enum ActionName {
  LogMine = 'logmine',
  LogRand = 'logrand',
  LogTransfer = 'logtransfer',
  LogBurn = 'logburn',
  LogMint = 'logmint',
}

export type ActionReceiptDto = {
  receiver: string;
  act_digest: string;
  global_sequence: number;
  recv_sequence: number;
  auth_sequence: [string, number][];
  code_sequence: number;
  abi_sequence: number;
};

export type ProcessedActionDto = {
  account: string;
  name?: string;
  authorization?: AuthorizationDto[];
  data?: any;
  hex_data?: string;
};

export type AuthorizationDto = {
  actor: string;
  permission: string;
};

export type ActionTraceDto = {
  act: ProcessedActionDto;
  receiver: string;
  receipt: ActionReceiptVersionAndValueDto;
};

export type TransactionTraceDto = {
  id: string;
  action_traces: ActionVersionAndValueDto[];
};

export type ActionReceiptVersionAndValueDto = [string, ActionReceiptDto];
export type ActionVersionAndValueDto = [string, ActionTraceDto];
export type TraceVersionAndValueDto = [string, TransactionTraceDto];

/**
 * Represents TraceHandler.
 *
 * @class
 */
export class TraceHandler {
  private config: Config;
  private amq: Messages;
  private stats: StatsDisplay;
  private BUFFER_SIZE = 4;
  public api: typeof Api;
  public rpc: typeof JsonRpc;

  /**
   * Creates instances of the Tracehandler class
   *
   * @param {Config} config
   * @param {Amq} amq
   * @param {StatsDisplay} stats
   */
  constructor(config: Config, amq: Messages, stats: StatsDisplay) {
    this.config = config;
    this.amq = amq;
    this.stats = stats;

    this.rpc = new JsonRpc(config.endpoints[0], { fetch });
    this.api = new Api({
      rpc: this.rpc,
      signatureProvider: null,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    });
  }

  /**
   * Write a number to an instance of the Buffer class
   *
   * @private
   * @param {number} value
   * @param {number} size
   * @returns {Buffer}
   */
  private int32ToBuffer(
    value: number,
    size: number = this.BUFFER_SIZE
  ): Buffer {
    const buffer = Buffer.alloc(size);
    buffer.writeUInt32BE(value);
    return buffer;
  }

  /**
   * Create action buffer
   *
   * @private
   * @param {string} transactionTraceId
   * @param {ActionTraceDto} actionTrace
   * @param {number} blockNumber
   * @param {Date} blockTimestamp
   * @returns {Buffer}
   */
  private createActionBuffer(
    transactionTraceId: string,
    actionTrace: ActionTraceDto,
    blockNumber: number,
    blockTimestamp: Date
  ): Buffer {
    this.stats.add('actions');

    const {
      act: { account, name, data },
      receipt: [, receipt],
    } = actionTrace;

    // Create action buffer
    const actionSerialBuffer = new Serialize.SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
    });
    actionSerialBuffer.pushName(account);
    actionSerialBuffer.pushName(name);
    actionSerialBuffer.pushBytes(data);
    const actionBuffer = Buffer.from(actionSerialBuffer.array);

    // Create a buffer with block number
    const blockBuffer = Buffer.allocUnsafe(8);
    blockBuffer.writeBigInt64BE(BigInt(blockNumber), 0);

    // Create a buffer with block timestamp
    const timestampBuffer = this.int32ToBuffer(blockTimestamp.getTime() / 1000);

    // Create a buffer with transaction trace id
    const transactionTraceIdBuffer = Buffer.from(transactionTraceId, 'hex');

    // Create a buffer with receive sequence
    const recvBuffer = Buffer.allocUnsafe(8);
    recvBuffer.writeBigInt64BE(BigInt(receipt.recv_sequence), 0);

    // Creat a buffer with global sequence
    const globalBuffer = Buffer.allocUnsafe(8);
    globalBuffer.writeBigInt64BE(BigInt(receipt.global_sequence), 0);

    return Buffer.concat([
      blockBuffer,
      timestampBuffer,
      transactionTraceIdBuffer,
      recvBuffer,
      globalBuffer,
      actionBuffer,
    ]);
  }

  /**
   * Convert the given data into a series of buffers which are then sent to the "action" queue
   *
   * This method is used, inter alia, in here:
   * @see {@link https://github.com/eosdac/eosio-statereceiver/blob/master/statereceiver.js#L201}
   * @param {number} blockNumber
   * @param {Array<TraceVersionAndValueDto>} traces
   * @param {Date} blockTimestamp
   */
  public processTrace(
    blockNumber: number,
    traces: TraceVersionAndValueDto[],
    blockTimestamp: Date
  ) {
    this.stats.add('blocks');

    const {
      miningContract,
      atomicAssets: { contract },
    } = this.config;

    for (const trace of traces) {
      const [version, transactionTrace] = trace;

      if (version == 'transaction_trace_v0') {
        this.stats.add('txs');

        const { action_traces, id } = transactionTrace;

        for (const action of action_traces) {
          const [version, actionTrace] = action;
          const {
            act: { account, name },
            receiver,
          } = actionTrace;
          if (
            version == 'action_trace_v0' &&
            [miningContract, contract].includes(account) &&
            Object.values<string>(ActionName).includes(name) &&
            receiver === account
          ) {
            const actionBuffer = this.createActionBuffer(
              id,
              actionTrace,
              blockNumber,
              blockTimestamp
            );
            this.amq.send(MessageQueue.Action, actionBuffer);

            this.stats.add(name);
          }
        }
      }
    }
  }
}
