import {StatsDisplay} from "./include/statsdisplay";

import { Amq } from './connections/amq';
import { connectMongo } from './connections/mongo';
import { AbiDeserializer } from './include/abideserializer';
import { AssetAggregator } from './include/assetaggregator';
const { Api, JsonRpc, Serialize } = require('eosjs');
const { Long } = require('mongodb');
import { deserialize, ObjectSchema } from "atomicassets";
import * as cluster from "cluster";
import * as os from 'os';
const crypto = require('crypto');


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

    constructor (config, deserializer, amq, mongo, stats) {
        const fetch = require('node-fetch');

        this.config = config;
        this.amq = amq;
        this.deserializer = deserializer;
        this.mongo = mongo;
        this.template_cache = {};
        this.schema_cache = {};
        this.logger = console;
        this.stats = stats;

        this.recalc_worker = null;

        this.rpc = new JsonRpc(config.endpoints[0], {fetch});
        this.api = new Api({
            rpc: this.rpc,
            signatureProvider: null,
            chainId: this.config.chain_id,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });
    }

    start () {
        console.log(`Starting processor`);
        this.amq.listen('action', this.process_action_job.bind(this));
        this.amq.listen('atomic_deltas', this.process_aa_delta_job.bind(this));
    }

    buffer_to_bigint (buf) {
        const hex = [];
        const u8 = Uint8Array.from(buf);

        u8.forEach(function (i) {
            var h = i.toString(16);
            if (h.length % 2) { h = '0' + h; }
            hex.push(h);
        });

        return BigInt('0x' + hex.join(''));
    }

    async get_schema (schema_name, collection_name) {
        if (typeof this.schema_cache[`${schema_name}::${collection_name}`] !== 'undefined'){
            return this.schema_cache[`${schema_name}::${collection_name}`];
        }

        const schema_res = await this.rpc.get_table_rows({
            code: this.config.atomicassets.contract,
            scope: collection_name,
            table: 'schemas',
            lower_bound: schema_name,
            upper_bound: schema_name,
            limit: 1
        });

        if (!schema_res.rows.length){
            console.error(`Could not find schema with name ${schema_name} in collection ${collection_name}`);
            return null;
        }

        const schema = ObjectSchema(schema_res.rows[0].format);

        this.schema_cache[`${schema_name}::${collection_name}`] = schema;

        return schema;
    }

    async template_data (template_id) {
        if (typeof this.template_cache[template_id] !== 'undefined'){
            return this.template_cache[template_id];
        }

        const template_res = await this.rpc.get_table_rows({
            code: this.config.atomicassets.contract,
            scope: this.config.atomicassets.collection,
            table: 'templates',
            lower_bound: template_id,
            upper_bound: template_id,
            limit: 1
        });

        if (!template_res.rows.length){
            throw new Error(`Could not find template ID ${template_id}`);
        }

        const schema_name = template_res.rows[0].schema_name;
        const schema = await this.get_schema(schema_name, this.config.atomicassets.collection);

        if (schema){
            try {
                const template_data = deserialize(template_res.rows[0].immutable_serialized_data, schema);

                this.template_cache[template_id] = template_data;

                return template_data;
            }
            catch (e){
                console.error(`Could not deserialize atomic data ${e.message}`);
                delete this.schema_cache[`${schema_name}::${this.config.atomicassets.collection}`];
                throw e;
            }
        }
        else {
            console.error(`Could not find schema for template ${template_id}`);
            return {};
        }
    }

    async save_action_data (account, name, data, block_num, block_timestamp, global_sequence) {
        const combined = `${account}::${name}`;
        try {
            const store_data = data;

            switch (combined){
                case 'm.federation::logmine':
                    const [bounty_str] = data.bounty.split(' ');
                    store_data.bounty = parseInt(bounty_str.replace('.', ''));
                    store_data.block_num = Long.fromString(block_num.toString());
                    store_data.block_timestamp = block_timestamp;
                    store_data.global_sequence = Long.fromString(global_sequence.toString());

                    const col = this.mongo.collection('mines');
                    // console.log(`Saving data for ${account}::${name}`, data);
                    const res = await col.insertOne(store_data);

                    break;
                case 'm.federation::logrand':
                    store_data.block_num = Long.fromString(block_num.toString());
                    store_data.block_timestamp = block_timestamp;
                    store_data.global_sequence = Long.fromString(global_sequence.toString());

                    if (store_data.template_id > 0){
                        store_data.template_data = await this.template_data(store_data.template_id);

                        const col = this.mongo.collection('nfts');
                        const res = await col.insertOne(store_data);
                    }
                    break;
                /*case `${this.config.atomicassets.contract}::lognewtempl`:
                    store_data.block_num = Long.fromString(block_num.toString());
                    store_data.block_timestamp = block_timestamp;
                    store_data.global_sequence = Long.fromString(global_sequence.toString());

                    let immutable = {};
                    store_data.immutable_data.forEach(i => {
                        if (i.key.indexOf('.') > -1){
                            i.key = i.key.replace(/\./g, '_')
                        }
                        immutable[i.key] = i.value[1];
                    });
                    store_data.immutable_data = immutable;

                    const col_t = this.mongo.collection('templates');
                    const res_t = await col_t.insertOne(store_data);
                    break;*/
            }

            this.stats.add(combined);
        }
        catch (e) {
            if (e.code !== 11000){
                throw e;
            }
            else {
                this.stats.add(`duplicate_${combined}`);
            }
        }
    }

    async save_atomic_delta_data (scope, table, data, block_num, sequence, block_timestamp, data_hash, present) {
        const store_data = data
        const collection_name = data.collection_name || scope
        const schema = await this.get_schema(data.schema_name, collection_name)

        if (schema){
            switch (table) {
                case 'assets':
                    store_data.owner = scope;
                    store_data.asset_id = Long.fromString(store_data.asset_id);
                    store_data.mutable_serialized_data = deserialize(store_data.mutable_serialized_data, schema);
                    store_data.immutable_serialized_data = deserialize(store_data.immutable_serialized_data, schema);
                    for (let key in store_data.immutable_serialized_data){
                        if (key.indexOf('.') > -1){
                            const val = store_data.immutable_serialized_data[key];
                            delete store_data.immutable_serialized_data[key];
                            key = key.replace(/\./g, '^');
                            store_data.immutable_serialized_data[key] = val;
                        }
                    }
                    for (let key in store_data.mutable_serialized_data){
                        if (key.indexOf('.') > -1){
                            const val = store_data.mutable_serialized_data[key];
                            delete store_data.mutable_serialized_data[key];
                            key = key.replace(/\./g, '^');
                            store_data.mutable_serialized_data[key] = val;
                        }
                    }

                    table = 'assets_raw';
                    break;
                case 'templates':
                    store_data.collection = scope;
                    store_data.immutable_serialized_data = deserialize(store_data.immutable_serialized_data, schema);
                    for (let key in store_data.immutable_serialized_data){
                        if (key.indexOf('.') > -1){
                            const val = store_data.immutable_serialized_data[key];
                            delete store_data.immutable_serialized_data[key];
                            key = key.replace(/\./g, '^');
                            store_data.immutable_serialized_data[key] = val;
                        }
                    }
                    break;
                case 'schemas':
                    break;
            }
        }
        else {
            console.error(`Could not load schema for ${table} ${store_data.asset_id || ''}${store_data.template_id || ''}`);
            return;
        }


        store_data.block_num = Long.fromString(block_num.toString());
        store_data.sequence = Long.fromString(sequence.toString());
        store_data.block_timestamp = block_timestamp;
        store_data.data_hash = data_hash;
        store_data.present = !!present;

        // console.log(store_data);
        const col = this.mongo.collection(table);
        try {
            const res = await col.insertOne(store_data);

            if (table === 'assets_raw'){
                // console.log(`sending recalc meszsage ${store_data.asset_id}`)
                process.send({type: 'recalc', asset_id: store_data.asset_id});
            }

            this.stats.add(`delta::${table}`);
        }
        catch (e){
            if (e.code === 11000){
                // duplicate index
                this.stats.add(`delta_duplicate::${table}`);
            }
            else {
                throw e;
            }
            // console.log(e.code);
        }
    }

    async process_action_job (job) {
        const sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder,
            array: new Uint8Array(job.content)
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
            const data = await this.deserializer.deserialize_action(account, name, Buffer.from(data_arr), block_num);
            await this.save_action_data(account, name, data, block_num, block_timestamp, global_sequence);

            await this.amq.ack(job);
        }
        catch (e){
            console.error(`Error processing job for ${account}::${name} - ${e.message} in block ${block_num} (${trx_id})`);
            if (e.message.indexOf('key') !== -1 && e.message.indexOf('must not contain') !== -1){
                // ignore errors in data like one in https://wax.bloks.io/transaction/8a054d3fb4d0fdfe7141d4be3f59250539aa3d65ef82b6a0c0fef8a6118e7580
                await this.amq.ack(job);
            }
            else {
                await this.amq.reject(job);
            }
        }
    }

    async get_table_type (code, table) {
        const contract = await this.api.getContract(code);
        const abi = await this.api.getAbi(code);

        // this.logger.info(abi)

        let this_table, type;
        for (let t of abi.tables) {
            if (t.name === table) {
                this_table = t;
                break
            }
        }

        if (this_table) {
            type = this_table.type
        } else {
            this.logger.error(`Could not find table "${table}" in the abi`, {code, table});
            return
        }

        return contract.types.get(type)
    }

    async process_aa_delta_job (job) {
        const sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder,
            array: new Uint8Array(job.content)
        });


        const block_num = this.buffer_to_bigint(sb.getUint8Array(8));
        const sequence = this.buffer_to_bigint(sb.getUint8Array(8));
        const present = sb.get();
        const block_timestamp_arr = sb.getUint8Array(4);
        // const block_timestamp_int = sb.getUint32();
        let buffer = Buffer.from(block_timestamp_arr);
        var block_timestamp_int = buffer.readUInt32BE(0);
        const block_timestamp = new Date(block_timestamp_int * 1000);
        sb.get(); // version
        const code = sb.getName();
        const scope = sb.getName();
        const table = sb.getName();
        const primary_key = this.buffer_to_bigint(sb.getUint8Array(8));
        const payer = sb.getName();
        const data_raw = sb.getBytes();


        try {
            const data = await this.deserializer.deserialize_table(code, table, Buffer.from(data_raw), block_num);
            // console.log(data, scope);

            // if (table === 'templates'){
            //     console.log('templates', scope, this.config.atomicassets.collection)
            // }
            const data_hash = crypto.createHash('sha1').update(data_raw).digest('hex');
            // console.log(data);
            // console.log(table);
            await this.save_atomic_delta_data(scope, table, data, block_num, sequence, block_timestamp, data_hash, present);
            // if (data.collection_name === this.config.atomicassets.collection || scope === this.config.atomicassets.collection){
            // }

            await this.amq.ack(job);

        } catch (e) {
            console.error(`Error deserializing ${code}:${table} in block ${block_num} : ${e.message}`, {e});
            this.amq.reject(job);
        }
    }
}


const deserializer = new AbiDeserializer(`${__dirname}/abis`);

(async () => {
    const config = require(`${__dirname}/config`);

    const amq = new Amq(config.amq);
    await amq.init();

    const mongo = await connectMongo(config.mongo);

    await deserializer.load();


    if (cluster.isMaster){
        let threads = parseInt(config.processor_threads);
        console.log(`Threads set to ${threads}`);
        if (threads === 0 || isNaN(threads)){
            const cpus = os.cpus().length;
            console.log(`We have ${cpus} CPUs, setting threads to ${cpus - 4}`);
            threads = cpus - 4;
        }

        const workers = [];
        // recalc_worker
        const recalc_worker = await cluster.fork();
        recalc_worker.on('message', (msg) => {
            // Worker is online
            if (msg.online){
                recalc_worker.send({type: 'recalc'});

                // start the processor workers
                for (let i = 0; i < threads - 1; i++) {
                    workers.push(cluster.fork());
                    workers[i].on('message', (msg) => {
                        // Worker is online
                        if (msg.online){
                            workers[i].send({type: 'processor'});
                        }
                        else {
                            // console.log('other msg', msg)
                            recalc_worker.send(msg);
                        }
                    });
                }
            }
        });
    }
    else {
        let aggregator = null
        process.on('message', function(msg) {
            // console.log('Worker ' + process.pid + ' received message from master.', msg);
            switch (msg.type){
                case 'processor':
                    const stats = new StatsDisplay();
                    const api = new AlienAPIProcessor(config, deserializer, amq, mongo, stats);
                    api.start();
                    break;
                case 'recalc':
                    if (!aggregator){
                        aggregator = new AssetAggregator(config, mongo);
                    }
                    if (msg.asset_id){
                        // todo - send this to rabbitmq so we dont lose any
                        //aggregator.process(msg.asset_id);
                    }
                    break;
            }
        });

        process.send({online: true});
    }
})();
