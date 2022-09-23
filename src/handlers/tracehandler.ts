import { StatsDisplay } from '../include/statsdisplay';
const { Api, JsonRpc, Serialize } = require('eosjs');
// const nodeAbieos = require('@eosrio/node-abieos');

export class TraceHandler {
  config: any;
  eos_rpc: typeof JsonRpc;
  eos_api: typeof Api;
  abis: Array<any>;
  current_abi: String;
  amq: any;
  stats: StatsDisplay;
  filtered_actions: Array<string>;
  abi_update_action = 'eosio::setabi';

  constructor({ config, amq, stats }) {
    this.config = config;
    this.amq = amq;
    this.stats = stats;

    const fetch = require('node-fetch');
    this.eos_rpc = new JsonRpc(config.endpoints[0], { fetch });
    this.eos_api = new Api({
      rpc: this.eos_rpc,
      signatureProvider: null,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    });

    this.filtered_actions = [
      `${this.config.notify_contract}::logmine`,
      `${this.config.mining_contract}::logmine`,
      `${this.config.mining_contract}::logrand`,
      `${this.config.atomicassets.contract}::logtransfer`,
      `${this.config.atomicassets.contract}::logburn`,
      `${this.config.atomicassets.contract}::logmint`,
      this.abi_update_action,
    ];
  }

  int32ToBuffer(num) {
    const arr = Buffer.alloc(4);
    arr.writeUInt32BE(num, 0);
    return arr;
  }

  handleTrace(block_num, block_timestamp, trace) {
    const [api_message, trx] = trace;

    if (api_message !== 'transaction_trace_v0') return;
    this.stats.add('txs');
    for (const action of trx.action_traces) {
      this.handleAction(block_num, block_timestamp, trx, action);
    }
  }

  serialize(block_num, block_timestamp, trx, trace) {
    const sb_action = new Serialize.SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
    });

    sb_action.pushName(trace.act.account);
    sb_action.pushName(trace.act.name);
    sb_action.pushBytes(trace.act.data);

    const block_buffer = Buffer.allocUnsafe(8);
    block_buffer.writeBigInt64BE(BigInt(block_num), 0);
    const timestamp_buffer = this.int32ToBuffer(
      block_timestamp.getTime() / 1000
    );
    const trx_id_buffer = Buffer.from(trx.id, 'hex');
    const recv_buffer = Buffer.allocUnsafe(8);
    recv_buffer.writeBigInt64BE(BigInt(trace.receipt[1].recv_sequence), 0);
    const global_buffer = Buffer.allocUnsafe(8);
    global_buffer.writeBigInt64BE(BigInt(trace.receipt[1].global_sequence), 0);

    const action_buffer = Buffer.from(sb_action.array);
    // this.logger.info(`Publishing action`)
    // console.log(`Sending ${trace.act.name} to queue`);
    return Buffer.concat([
      block_buffer,
      timestamp_buffer,
      trx_id_buffer,
      recv_buffer,
      global_buffer,
      action_buffer,
    ]);
  }

  setabiConcernsUs(trace) {
    const account = trace.act.data.account;
    return account && this.config.abi_fetch_contracts.includes(account);
  }

  handleAction(block_num, block_timestamp, trx, action) {
    const [api_message, trace] = action;

    if (api_message !== 'action_trace_v0') return;

    this.stats.add('actions');

    // console.log('handleAction: trace: ' + JSON.stringify(trace, null, 2));
    if (trace.receiver !== trace.act.account) return;

    const action_name = `${trace.receiver}::${trace.act.name}`;

    if (!this.filtered_actions.includes(action_name)) return;

    if (action_name === this.abi_update_action && !this.setabiConcernsUs(trace))
      return;

    const buffers = this.serialize(block_num, block_timestamp, trx, trace);
    this.amq.send('action', buffers);
    this.stats.add(trace.act.name);
  }

  async processTrace(block_num, traces, block_timestamp) {
    this.stats.add('blocks');
    for (const trace of traces) {
      this.handleTrace(block_num, block_timestamp, trace);
    }
  }
}
