import {StatsDisplay} from "../include/statsdisplay";
const {Api, JsonRpc, Serialize} = require('eosjs');

export class DeltaHandler {
    config: any;
    amq: any;
    stats: StatsDisplay;

    constructor ({config, amq, stats}) {
        this.config = config;
        this.amq = amq;
        this.stats = stats;
    }

    int32ToBuffer (num) {
        const arr = Buffer.alloc(4);
        arr.writeUInt32BE(num, 0);
        return arr;
    }

    async processDelta(block_num, deltas, abi, block_timestamp) {
        let sequence = 0;
        for (const delta of deltas) {
            // this.logger.info(delta)
            switch (delta[0]) {
                case 'table_delta_v0':
                    if (delta[1].name === 'contract_row') {
                        // continue
                        for (const row of delta[1].rows) {

                            const sb = new Serialize.SerialBuffer({
                                textEncoder: new TextEncoder,
                                textDecoder: new TextDecoder,
                                array: row.data
                            });

                            let code;
                            try {
                                sb.get(); // ?
                                code = sb.getName();

                                if (code === this.config.atomicassets.contract){
                                    const scope = sb.getName();
                                    const table = sb.getName();

                                    if (table === 'assets' || table === 'schemas'){
                                        const ts = Math.floor(block_timestamp.getTime() / 1000);
                                        const timestamp_buffer = this.int32ToBuffer(ts);
                                        const block_buffer = Buffer.allocUnsafe(8);
                                        block_buffer.writeBigInt64BE(BigInt(block_num), 0);
                                        // add a sequence, 32 bit block number should be enough
                                        const sequence_buffer = Buffer.allocUnsafe(12);
                                        sequence_buffer.fill(0);
                                        sequence_buffer.writeBigInt64BE(BigInt(block_num), 1);
                                        sequence_buffer.writeUInt16BE(sequence, 10);
                                        // console.log(sequence, sequence_buffer.slice(4), (block_num << 6), typeof block_num, block_num);
                                        const present_buffer = Buffer.from([row.present]);
                                        // this.logger.info(`Publishing ${name}`)
                                        this.amq.send('atomic_deltas', Buffer.concat([block_buffer, sequence_buffer.slice(4), present_buffer, timestamp_buffer, Buffer.from(row.data)]));

                                        sequence++;

                                        this.stats.add('Atomic Deltas');

                                        // console.log(`AA Delta`, scope, table);
                                        // process.exit(0);
                                    }
                                }
                            } catch (e) {
                                console.error(e.message);
                            }
                        }
                    }
                    break;
            }
        }
    }
}
