/* eslint-disable no-unused-vars */
const StateReceiver = require('@eosdacio/eosio-statereceiver');
import { Amq } from './connections/amq';
// import { connectMongo } from './connections/mongo';
import { StatsDisplay } from './include/statsdisplay';
import { TraceHandler } from './handlers/tracehandler';
import { DeltaHandler } from './handlers/deltahandler';
// import { program } from 'commander';
// import fetch from 'node-fetch';
import * as cluster from 'cluster';
import * as os from 'os';
const { Serialize } = require('eosjs');

class AlienAPIBlockRange {
  state_receiver: typeof StateReceiver;
  config: any;
  stats: any;
  amq: any;

  constructor(config, amq, stats) {
    console.log(`Constructing...`, config);

    this.config = config;
    this.stats = stats;
    this.amq = amq;
  }

  buffer_to_bigint(buf) {
    const hex = [];
    const u8 = Uint8Array.from(buf);

    u8.forEach(function (i) {
      var h = i.toString(16);
      if (h.length % 2) {
        h = '0' + h;
      }
      hex.push(h);
    });

    return BigInt('0x' + hex.join(''));
  }

  async process_blockrange_job(job) {
    const sb = new Serialize.SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
      array: new Uint8Array(job.content),
    });

    // console.log(sb.array, sb.array.length);
    // process.exit(0);

    const from = this.buffer_to_bigint(sb.getUint8Array(8));
    const to = this.buffer_to_bigint(sb.getUint8Array(8));

    console.log(`Received job`);

    const statereceiver_config = {
      eos: {
        wsEndpoint: this.config.ship_endpoints[0],
        chainId: this.config.chain_id,
        endpoint: this.config.endpoints[0],
      },
    };
    // console.log(`Starting filler`);
    const trace_handler = new TraceHandler({
      config: this.config,
      amq: this.amq,
      stats: this.stats,
    });
    const delta_handler = new DeltaHandler({
      config: this.config,
      amq: this.amq,
      stats: this.stats,
    });

    this.state_receiver = new StateReceiver({
      startBlock: from.toString(),
      endBlock: to.toString(),
      mode: 0,
      config: statereceiver_config,
    });
    this.state_receiver.registerTraceHandler(trace_handler);
    // this.state_receiver.registerDeltaHandler(delta_handler);
    this.state_receiver.registerDoneHandler(() => {
      this.amq.ack(job);
      this.stats.add(`Processed range`);
      console.log(`Completed range ${from.toString()}-${to.toString()}`);
    });

    this.state_receiver.start();
  }

  async start() {
    this.amq.listen('aw_block_range', this.process_blockrange_job.bind(this));
  }
}

(async () => {
  const config = require(`./config`);

  const amq = new Amq(config.amq);
  await amq.init();

  if (cluster.isMaster) {
    let threads = parseInt(config.blockrange_threads);
    if (threads === 0 || isNaN(threads)) {
      const cpus = os.cpus().length;
      threads = cpus - 4;
    }
    console.log(`Threads set to ${threads}`);

    for (let i = 0; i < threads; i++) {
      cluster.fork();
    }
  } else {
    const stats = new StatsDisplay();

    const api = new AlienAPIBlockRange(config, amq, stats);
    await api.start();
  }
})();
