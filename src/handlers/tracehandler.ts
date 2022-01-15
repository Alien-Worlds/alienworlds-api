import {StatsDisplay} from "../include/statsdisplay";
const {Api, JsonRpc, Serialize} = require('eosjs');
// const nodeAbieos = require('@eosrio/node-abieos');

export class TraceHandler {
    config: any;
    eos_rpc: typeof JsonRpc;
    eos_api: typeof Api;
    abis: Array<any>;
    current_abi: String;
    amq: any;
    stats: StatsDisplay;

    constructor ({config, amq, stats}) {
        this.config = config;
        this.amq = amq;
        this.stats = stats;

        const fetch = require('node-fetch');
        this.eos_rpc = new JsonRpc(config.endpoints[0], {fetch});
        this.eos_api = new Api({ rpc: this.eos_rpc, signatureProvider:null, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

        // nodeAbieos.load_abi_hex("m.federation", JSON.stringify(mining_abi));
    }

    int32ToBuffer (num) {
        const arr = Buffer.alloc(4);
        arr.writeUInt32BE(num, 0);
        return arr;
    }

    async processTrace(block_num, traces, block_timestamp) {
        this.stats.add('blocks');

        for (const trace of traces) {
            switch (trace[0]) {
                case 'transaction_trace_v0': {
                    const trx = trace[1];
                    this.stats.add('txs');

                    for (let action of trx.action_traces) {
                        switch (action[0]) {
                            case 'action_trace_v0':
                                if (action[1].act.account === this.config.mining_contract || action[1].act.account === this.config.atomicassets.contract) {
                                    this.stats.add('actions');

                                    switch (action[1].act.name) {
                                        case 'logmine':
                                        case 'logrand':
                                        case 'logtransfer':
                                        case 'logburn':
                                        case 'logmint': {
                                            // case 'logsetdata':
                                            // case 'lognewtempl':
                                            //     const json = await this.deserializer.deserialize(action[1].act.account, action[1].act.name, action[1].act.data, block_num);
                                            //     const type = nodeAbieos.get_type_for_action(action[1].act.account, action[1].act.name);
                                            //     const json = nodeAbieos.bin_to_json(action[1].act.account, type, Buffer.from(action[1].act.data));
                                            //     console.log(action[1].act.name, json);
                                            // console.log(action[1].act.authorization)
                                            // if (action[1].receipt[1].global_sequence == '3024635758'){
                                            // const data = await this.eos_api.deserializeActions([action[1].act])
                                            // console.log(data[0], action[1], action[1].receipt[1].global_sequence)
                                            // console.log(action[1])
                                            // process.exit(0)
                                            // }

                                            if (action[1].receiver !== action[1].act.account) {
                                                continue;
                                            }
                                            // console.log(action[1])

                                            const sb_action = new Serialize.SerialBuffer({
                                                textEncoder: new TextEncoder,
                                                textDecoder: new TextDecoder
                                            });

                                            sb_action.pushName(action[1].act.account);
                                            sb_action.pushName(action[1].act.name);
                                            sb_action.pushBytes(action[1].act.data);

                                            const block_buffer = Buffer.allocUnsafe(8);
                                            block_buffer.writeBigInt64BE(BigInt(block_num), 0);
                                            const timestamp_buffer = this.int32ToBuffer(block_timestamp.getTime() / 1000);
                                            const trx_id_buffer = Buffer.from(trx.id, 'hex');
                                            const recv_buffer = Buffer.allocUnsafe(8);
                                            recv_buffer.writeBigInt64BE(BigInt(action[1].receipt[1].recv_sequence), 0);
                                            const global_buffer = Buffer.allocUnsafe(8);
                                            global_buffer.writeBigInt64BE(BigInt(action[1].receipt[1].global_sequence), 0);

                                            const action_buffer = Buffer.from(sb_action.array);
                                            // this.logger.info(`Publishing action`)
                                            // console.log(`Sending ${action[1].act.name} to queue`);
                                            this.amq.send('action', Buffer.concat([block_buffer, timestamp_buffer, trx_id_buffer, recv_buffer, global_buffer, action_buffer]));

                                            this.stats.add(action[1].act.name);
                                            break;
                                        }
                                    }
                                }

                                break;
                        }
                    }
                }
            }
        }
    }
}
