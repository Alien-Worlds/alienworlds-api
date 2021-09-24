const StateReceiver = require('@eosdacio/eosio-statereceiver');
import { Amq } from './connections/amq';
import { connectMongo } from './connections/mongo';
import { StatsDisplay } from './include/statsdisplay';
import { TraceHandler } from './handlers/tracehandler';
import { config, ConfigType } from './config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

interface AlienAPIFillerOptions {
  startBlock: number;
  endBlock: number;
  test: number;
}

class AlienAPIFiller {
  state_receiver: typeof StateReceiver;
  config: ConfigType;

  options: AlienAPIFillerOptions;
  mongo: { collection: (arg0: string) => any };
  stats: any;
  amq: { send: (arg0: string, arg1: Buffer) => any };

  constructor(
    config: ConfigType,
    options: AlienAPIFillerOptions,
    amq,
    mongo,
    stats
  ) {
    console.log(`Constructing...`, config, options);

    this.config = config;
    this.options = options;
    this.mongo = mongo;
    this.stats = stats;
    this.amq = amq;
  }

  async start() {
    var { startBlock, endBlock = 0xffffffff } = this.options;

    if (startBlock === -1) {
      console.log(`Finding start block from DB`);

      // find the last block indexed
      const col = this.mongo.collection('mines');
      const { block_num } = await col.findOne(
        {},
        { limit: 1, sort: { block_num: -1 } }
      );
      if (block_num) {
        startBlock = block_num;
      }
    }

    console.log(`Starting from ${startBlock}, ending at ${endBlock}`);

    const statereceiver_config = {
      eos: {
        wsEndpoint: this.config.ship_endpoints[0],
        chainId: this.config.chain_id,
        endpoint: this.config.eosio_endpoints[0],
      },
    };

    console.log(`Starting filler`);
    const trace_handler = new TraceHandler({
      ...this,
    });
    // const delta_handler = new DeltaHandler({config: this.config, amq: this.amq, stats: this.stats});

    this.state_receiver = new StateReceiver({
      startBlock,
      endBlock,
      mode: 0,
      config: statereceiver_config,
    });
    this.state_receiver.registerTraceHandler(trace_handler);
    // this.state_receiver.registerDeltaHandler(delta_handler);
    this.state_receiver.start();
  }
}

(async () => {
  console.log('start async');
  const stats = new StatsDisplay();
  const options: AlienAPIFillerOptions = await yargs(hideBin(process.argv))
    .version('0.1')
    .option('startBlock', {
      alias: 's',
      number: true,
      default: -1,
      description: 'Start at this block',
    })
    .option('endBlock', {
      alias: 'e',
      number: true,
      description: 'End at this block (exclusive)',
      default: 4294967295,
    })
    .option('test', {
      alias: 't',
      number: true,
      default: 0,
      description: 'Test mode, specify a single block to pull and process',
    })
    .strict().argv;

  console.log('options: ', options);

  console.log('amq configs: ', config.amq.connection_string);
  const amq = new Amq(config);
  try {
    await amq.init();

    const mongo = await connectMongo(config.mongo);
    const api = new AlienAPIFiller(config, options, amq, mongo, stats);
    await api.start();
  } catch (error) {
    console.log('Error occured while starting the filler: ', error);
  }
})();
