import { StatsDisplay } from './include/statsdisplay';

import { Amq } from './connections/amq';
import { connectMongo } from './connections/mongo';
import { AbiDeserializer } from './include/abideserializer';
import { AssetAggregator } from './include/assetaggregator';
const { Api, JsonRpc, Serialize } = require('eosjs');
const { Long } = require('mongodb');
import { deserialize, ObjectSchema } from 'atomicassets';
import * as cluster from 'cluster';
import * as os from 'os';
const crypto = require('crypto');
const fetch = require('node-fetch');

class AlienAPIProcessor {
  config: any;
  amq: Amq;
  deserializer: AbiDeserializer;
  mongo: any;
  rpc: typeof JsonRpc;
  api: typeof Api;
  template_cache: any;
  schema_cache: any;
  logger: any;
  stats: StatsDisplay;
  recalc_worker: any;
  insert_queue: any;

  constructor(config, deserializer, amq, mongo, stats) {
    const fetch = require('node-fetch');

    this.config = config;
    this.amq = amq;
    this.deserializer = deserializer;
    this.mongo = mongo;
    this.template_cache = {};
    this.schema_cache = {};
    this.logger = console;
    this.stats = stats;
    this.insert_queue = [];

    this.recalc_worker = null;

    this.rpc = new JsonRpc(config.endpoints[0], { fetch });
    this.api = new Api({
      rpc: this.rpc,
      signatureProvider: null,
      chainId: this.config.chain_id,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    });

    // start queue processor
    console.log('Starting queue processor');
    setInterval(this.process_insert_queue.bind(this), 50);
  }

  start() {
    console.log(`Starting processor`);
    for (let i = 0; i < 30; i++) {
      // pull 10 jobs at a time
      this.amq.listen('action', this.process_action_job.bind(this));
      this.amq.listen('recalc_asset', this.process_recalc_job.bind(this));
    }
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

  async get_schema(schema_name, collection_name) {
    if (
      typeof this.schema_cache[`${schema_name}::${collection_name}`] !==
      'undefined'
    ) {
      return this.schema_cache[`${schema_name}::${collection_name}`];
    }

    const schema_res = await this.rpc.get_table_rows({
      code: this.config.atomicassets.contract,
      scope: collection_name,
      table: 'schemas',
      lower_bound: schema_name,
      upper_bound: schema_name,
      limit: 1,
    });

    if (!schema_res.rows.length) {
      console.error(
        `Could not find schema with name ${schema_name} in collection ${collection_name}`
      );
      return null;
    }

    const schema = ObjectSchema(schema_res.rows[0].format);

    this.schema_cache[`${schema_name}::${collection_name}`] = schema;

    return schema;
  }

  async template_data(template_id) {
    if (typeof this.template_cache[template_id] !== 'undefined') {
      return this.template_cache[template_id];
    }

    const template_res = await this.rpc.get_table_rows({
      code: this.config.atomicassets.contract,
      scope: this.config.atomicassets.collection,
      table: 'templates',
      lower_bound: template_id,
      upper_bound: template_id,
      limit: 1,
    });

    if (!template_res.rows.length) {
      throw new Error(`Could not find template ID ${template_id}`);
    }

    const schema_name = template_res.rows[0].schema_name;
    const schema = await this.get_schema(
      schema_name,
      this.config.atomicassets.collection
    );

    if (schema) {
      try {
        const template_data = deserialize(
          template_res.rows[0].immutable_serialized_data,
          schema
        );

        this.template_cache[template_id] = template_data;

        return template_data;
      } catch (e) {
        console.error(`Could not deserialize atomic data ${e.message}`);
        delete this.schema_cache[
          `${schema_name}::${this.config.atomicassets.collection}`
        ];
        throw e;
      }
    } else {
      console.error(`Could not find schema for template ${template_id}`);
      return {};
    }
  }

  async process_insert_queue() {
    const queue = this.insert_queue;
    this.insert_queue = [];
    const inserts = {};
    if (!queue) {
      console.log(`Queue is null`);
      return;
    }
    queue.forEach(q => {
      inserts[q.collection] = inserts[q.collection] || [];
      inserts[q.collection].push(q);
    });
    // console.log(inserts);
    for (let col_name in inserts) {
      const documents = inserts[col_name].map(i => i.document);

      const col = this.mongo.collection(col_name);

      // testing
      /*const to_delete = [];
            for (let d=0;d<documents.length;d++){
                if (d % 2 === 0){
                    // console.log(documents[d])
                    to_delete.push(documents[d].global_sequence)
                }
            }
            const delres = await col.deleteMany({global_sequence: {$in: to_delete}});*/

      col.insertMany(documents, { ordered: false }, (err, res) => {
        // console.log(err, res);
        if (err) {
          // some documents failed
          // console.log('ERROR', err.result);
          // console.log(err.result.result.writeErrors);
          // console.log(err.result.result.insertedIds);

          // loop through everything and see if the index errored
          for (let i = 0; i < inserts[col_name].length; i++) {
            const write_error = err.result.result.writeErrors.find(
              we => we.err.index === i
            );
            if (write_error) {
              if (write_error.err.code === 11000) {
                // console.log('duplicate')
                try {
                  this.amq.ack(inserts[col_name][i].job);
                } catch (e) {
                  console.error(e.message);
                  process.exit(1);
                }
              } else {
                this.amq.reject(inserts[col_name][i].job);
                // throw new Error(write_error.err.errmsg)
              }
              // console.error(i, write_error.err.errmsg);
            } else {
              this.amq.ack(inserts[col_name][i].job);
            }
            // console.log(inserts[col_name][i].job)

            //
          }

          /*for (let e = 0; e < err.result.result.writeErrors.length; e++){
                        const write_error = err.result.result.writeErrors[e];
                        console.log(write_error.err.op)
                    }*/
        } else if (res) {
          // console.log('SUCCESS', res)
          // all documents inserted
          inserts[col_name].forEach(i => {
            this.amq.ack(i.job);
          });
        }
      });
    }
  }

  async save_action_data(
    account,
    name,
    data,
    block_num,
    block_timestamp,
    global_sequence,
    tx_id,
    job
  ) {
    const combined = `${account}::${name}`;
    // console.log(combined);
    let queued = false;
    try {
      let store_data = data;

      switch (combined) {
        case 'm.federation::logmine':
          const [bounty_str] = data.bounty.split(' ');
          store_data.bounty = parseInt(bounty_str.replace('.', ''));
          store_data.block_num = Long.fromString(block_num.toString());
          store_data.block_timestamp = block_timestamp;
          store_data.global_sequence = Long.fromString(
            global_sequence.toString()
          );
          store_data.bag_items = data.bag_items.map(b => Long.fromString(b));
          store_data.tx_id = tx_id;

          const col = this.mongo.collection('mines');
          // console.log(`Saving data for ${account}::${name}`, data);
          // console.log(`Insert queue`)
          this.insert_queue.push({
            collection: 'mines',
            document: store_data,
            job,
          });
          // const res = await col.insertOne(store_data);
          queued = true;

          break;
        case 'm.federation::logrand':
          store_data.block_num = Long.fromString(block_num.toString());
          store_data.block_timestamp = block_timestamp;
          store_data.global_sequence = Long.fromString(
            global_sequence.toString()
          );

          if (store_data.template_id > 0) {
            store_data.template_data = await this.template_data(
              store_data.template_id
            );

            const col = this.mongo.collection('nfts');
            const res = await col.insertOne(store_data);
          }
          break;
        case `${this.config.atomicassets.contract}::logtransfer`:
        case `${this.config.atomicassets.contract}::logmint`:
        case `${this.config.atomicassets.contract}::logburn`:
          if (data.collection_name !== this.config.atomicassets.collection) {
            await this.amq.ack(job);
            return;
          }

          store_data = {};
          store_data.block_num = Long.fromString(block_num.toString());
          store_data.block_timestamp = block_timestamp;
          store_data.global_sequence = Long.fromString(
            global_sequence.toString()
          );

          store_data.type = name.replace('log', '');
          switch (store_data.type) {
            case 'transfer':
              store_data.from = data.from;
              store_data.to = data.to;
              store_data.asset_ids = data.asset_ids.map(a =>
                Long.fromString(a.toString())
              );
              break;
            case 'mint':
              store_data.from = null;
              store_data.to = data.new_asset_owner;
              store_data.asset_ids = [
                Long.fromString(data.asset_id.toString()),
              ];
              break;
            case 'burn':
              store_data.from = data.asset_owner;
              store_data.to = null;
              store_data.asset_ids = [
                Long.fromString(data.asset_id.toString()),
              ];
              break;
          }

          const col_t = this.mongo.collection('atomictransfers');
          const res_t = await col_t.insertOne(store_data);

          for (let a = 0; a < store_data.asset_ids.length; a++) {
            const asset_id = Buffer.allocUnsafe(8);
            asset_id.writeBigInt64BE(
              BigInt(store_data.asset_ids[a].toString()),
              0
            );
            this.amq.send('recalc_asset', Buffer.concat([asset_id]));
          }
          break;
      }

      if (!queued) {
        await this.amq.ack(job);
      }

      this.stats.add(combined);
    } catch (e) {
      if (e.code !== 11000) {
        throw e;
      } else {
        this.stats.add(`duplicate_${combined}`);

        if (!queued) {
          // console.log('ack job')
          await this.amq.ack(job);
        }
      }
    }
  }

  async process_action_job(job) {
    const sb = new Serialize.SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
      array: new Uint8Array(job.content),
    });

    // console.log(sb.array, sb.array.length);
    // process.exit(0);

    const block_num = this.buffer_to_bigint(sb.getUint8Array(8));
    const block_timestamp_arr = sb.getUint8Array(4);
    let buffer = Buffer.from(block_timestamp_arr);
    var block_timestamp_int = buffer.readUInt32BE(0);
    const block_timestamp = new Date(block_timestamp_int * 1000);
    const trx_id_arr = sb.getUint8Array(32);
    const trx_id = this.buffer_to_bigint(trx_id_arr).toString(16);
    const recv_sequence = this.buffer_to_bigint(sb.getUint8Array(8));
    const global_sequence = this.buffer_to_bigint(sb.getUint8Array(8));
    const account = sb.getName();
    const name = sb.getName();
    const data_arr = sb.getBytes();

    try {
      const data = await this.deserializer.deserialize_action(
        account,
        name,
        Buffer.from(data_arr),
        block_num
      );
      await this.save_action_data(
        account,
        name,
        data,
        block_num,
        block_timestamp,
        global_sequence,
        trx_id,
        job
      );

      // await this.amq.ack(job);
    } catch (e) {
      console.error(
        `Error processing job for ${account}::${name} - ${e.message} in block ${block_num} (${trx_id})`
      );
      if (
        e.message.indexOf('key') !== -1 &&
        e.message.indexOf('must not contain') !== -1
      ) {
        // ignore errors in data like one in https://wax.bloks.io/transaction/8a054d3fb4d0fdfe7141d4be3f59250539aa3d65ef82b6a0c0fef8a6118e7580
        await this.amq.ack(job);
      } else {
        await this.amq.reject(job);
      }
    }
  }

  async process_recalc_job(job) {
    const sb = new Serialize.SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
      array: new Uint8Array(job.content),
    });

    // console.log(sb.array, sb.array.length);
    // process.exit(0);

    const asset_id = this.buffer_to_bigint(sb.getUint8Array(8));

    try {
      // console.log('Processing asset', asset_id.toString())
      const col_t = this.mongo.collection('atomictransfers');
      const col_a = this.mongo.collection('assets');
      const asset_id_long = Long.fromString(asset_id.toString());
      const query = { asset_ids: asset_id_long };
      const transfer_res = await col_t.findOne(query, {
        sort: { global_sequence: -1 },
      });
      let asset = await col_a.findOne({ asset_id: asset_id_long });
      if (!asset) {
        asset = {
          asset_id: asset_id_long,
          data: await this.get_asset_data(asset_id.toString(), transfer_res.to),
        };
      }
      asset.owner = transfer_res.to;

      const update_doc = {
        $set: asset,
      };
      const update_query = {
        asset_id: asset_id_long,
      };
      await col_a.updateOne(update_query, update_doc, { upsert: true });

      // console.log(asset)
      await this.amq.ack(job);
    } catch (e) {
      if (e.message.substr(0, 8) === 'NOTFOUND') {
        console.log(e.message);
        await this.amq.ack(job);
      } else {
        console.error(`Error recalc asset ${asset_id.toString()}`, e.message);
        await this.amq.reject(job);
      }
    }
  }

  async get_asset_data(asset_id, owner) {
    const res = await this.rpc.get_table_rows({
      code: this.config.atomicassets.contract,
      scope: owner,
      table: 'assets',
      lower_bound: asset_id,
      upper_bound: asset_id,
      limit: 1,
    });

    if (!res.rows.length) {
      throw new Error(
        `NOTFOUND : Could not find asset ${asset_id} owned by ${owner}`
      );
    }

    const data: any = {};
    data.collection_name = res.rows[0].collection_name;
    data.schema_name = res.rows[0].schema_name;
    data.template_id = res.rows[0].template_id;

    const template_res = await this.rpc.get_table_rows({
      code: this.config.atomicassets.contract,
      scope: data.collection_name,
      table: 'templates',
      lower_bound: data.template_id,
      upper_bound: data.template_id,
      limit: 1,
    });

    const schema = await this.get_schema(
      data.schema_name,
      data.collection_name
    );
    data.immutable_serialized_data = deserialize(
      template_res.rows[0].immutable_serialized_data,
      schema
    );

    return data;
  }
}

const deserializer = new AbiDeserializer(`${__dirname}/abis`);

(async () => {
  const config = require(`${__dirname}/config`);

  const amq = new Amq(config.amq);
  await amq.init();

  const mongo = await connectMongo(config.mongo);

  await deserializer.load();

  if (cluster.isMaster) {
    let threads = parseInt(config.processor_threads);
    console.log(`Threads set to ${threads}`);
    if (threads === 0 || isNaN(threads)) {
      const cpus = os.cpus().length;
      console.log(`We have ${cpus} CPUs, setting threads to ${cpus - 4}`);
      threads = cpus - 4;
    }

    const workers = [];
    // recalc_worker
    const recalc_worker = await cluster.fork();
    recalc_worker.on('message', msg => {
      // Worker is online
      if (msg.online) {
        recalc_worker.send({ type: 'recalc' });

        // start the processor workers
        for (let i = 0; i < threads; i++) {
          workers.push(cluster.fork());
          workers[i].on('message', msg => {
            // Worker is online
            if (msg.online) {
              workers[i].send({ type: 'processor' });
            } else {
              // console.log('other msg', msg)
              recalc_worker.send(msg);
            }
          });
        }
      }
    });
  } else {
    let aggregator = null;
    process.on('message', function (msg) {
      // console.log('Worker ' + process.pid + ' received message from master.', msg);
      switch (msg.type) {
        case 'processor':
          const stats = new StatsDisplay();
          const api = new AlienAPIProcessor(
            config,
            deserializer,
            amq,
            mongo,
            stats
          );
          api.start();
          break;
        case 'recalc':
          if (!aggregator) {
            aggregator = new AssetAggregator(config, mongo);
          }
          if (msg.asset_id) {
            // todo - send this to rabbitmq so we dont lose any
            //aggregator.process(msg.asset_id);
          }
          break;
      }
    });

    process.send({ online: true });
  }
})();
