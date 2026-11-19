/* eslint-disable no-unused-vars */
const newrelic = require('newrelic');
import './include/disable-keepalive';
const StateReceiver = require('@eosdacio/eosio-statereceiver');
import { Amq } from './connections/amq';
// import { connectMongo } from './connections/mongo';
import { StatsDisplay } from './include/statsdisplay';
import { WorkerSupervisor } from './include/worker-supervisor';
import { guardJobHandler } from './include/job-guard';
import { TraceHandler } from './handlers/tracehandler';
import { DeltaHandler } from './handlers/deltahandler';
// import { program } from 'commander';
// import fetch from 'node-fetch';
import cluster from 'cluster';
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
    console.log('New Relic App Name: [' + process.env.NEW_RELIC_APP_NAME + ']');

    this.amq.listen(
      'aw_block_range',
      guardJobHandler(
        'aw_block_range',
        this.process_blockrange_job.bind(this),
        this.amq
      )
    );
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
      // At least one: with 4 CPUs or fewer, `cpus - 4` is zero or negative and no worker
      // would start.
      threads = Math.max(1, cpus - 4);
    }
    console.log(`Threads set to ${threads}`);

    // Restart any worker that exits (crash, unhandled error, process.exit), and log it.
    const supervisor = new WorkerSupervisor(cluster);
    supervisor.start();

    for (let i = 0; i < threads; i++) {
      supervisor.spawn('blockrange');
    }
  } else {
    const stats = new StatsDisplay();

    const api = new AlienAPIBlockRange(config, amq, stats);
    await api.start();
  }
})();
