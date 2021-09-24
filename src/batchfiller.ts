import { Amq } from './connections/amq';
import { connectMongo } from './connections/mongo';
import { StatsDisplay } from './include/statsdisplay';
import fetch from 'node-fetch';
import { config, ConfigType } from './config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface AlienBatchAPIFillerOptions {
  startBlock: number;
  endBlock: number;
}

class AlienBatchAPIFiller {
  config: ConfigType;

  options: AlienBatchAPIFillerOptions;
  mongo: { collection: (arg0: string) => any };
  amq: { send: (arg0: string, arg1: Buffer) => any };

  constructor(
    config: ConfigType,
    options: AlienBatchAPIFillerOptions,
    amq: Amq,
    mongo: any
  ) {
    console.log(`Constructing...`, config, options);

    this.config = config;
    this.options = options;
    this.mongo = mongo;
    this.amq = amq;
  }

  async start() {
    var {
      startBlock,
      endBlock = 0xffffffff,
    }: { startBlock: number; endBlock: number } = this.options;

    if (startBlock === -1) {
      console.log(`Finding start block from DB`);

      // find the last block indexed
      const col = this.mongo.collection('mines');
      const { block_num } = await col.findOne(
        {},
        { limit: 1, sort: { block_num: -1 } }
      );
      // console.log(res);
      if (block_num) {
        startBlock = block_num;
      }
    }

    console.log(`Starting from ${startBlock}, ending at ${endBlock}`);

    console.log(
      `Kicking off parallel replay, make sure you start a filler instance after this replay is complete`
    );

    if (endBlock === 0xffffffff) {
      console.log(
        `Fetching lib from ${this.config.eosio_endpoints[0]}/v1/chain/get_info`
      );
      const info_res = await fetch(
        `${this.config.eosio_endpoints[0]}/v1/chain/get_info`
      );
      const { last_irreversible_block_num } = await info_res.json();
      endBlock = last_irreversible_block_num;
    }
    console.log(`Ending at ${endBlock}`);

    const chunk_size = 10000;
    let from = startBlock;
    let to = from + chunk_size; // to is not inclusive
    let break_now = false;
    let number_jobs = 0;

    const send_promises = [];

    while (true) {
      console.log(`adding job for ${from} to ${to}`);
      process.stdout.write('.');

      const from_buffer = Buffer.allocUnsafe(8);
      from_buffer.writeBigInt64BE(BigInt(from), 0);

      const to_buffer = Buffer.allocUnsafe(8);
      to_buffer.writeBigInt64BE(BigInt(to), 0);

      send_promises.push(
        this.amq.send('aw_block_range', Buffer.concat([from_buffer, to_buffer]))
      );
      number_jobs++;

      if (to === endBlock) {
        break_now = true;
      }

      from += chunk_size;
      to += chunk_size;

      if (to > endBlock) {
        to = endBlock;
      }

      if (from > to) {
        break_now = true;
      }

      if (break_now) {
        break;
      }
    }

    console.log(`Added ${number_jobs} jobs`);

    await Promise.all(send_promises);
  }
}

(async () => {
  console.log('start async');
  const stats = new StatsDisplay();
  const options: AlienBatchAPIFillerOptions = await yargs(hideBin(process.argv))
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
    .strict().argv;

  console.log('options: ', options);

  console.log('amq configs: ', config.amq.connection_string);
  const amq = new Amq(config);
  try {
    await amq.init();

    const mongo = await connectMongo(config.mongo);
    const api = new AlienBatchAPIFiller(config, options, amq, mongo);
    await api.start();
  } catch (error) {
    console.log('Error occured while starting the filler: ', error);
  }
})();
