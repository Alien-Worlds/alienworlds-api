
const StateReceiver = require('@eosdacio/eosio-statereceiver');
import { Amq } from './connections/amq';
import { StatsDisplay } from './include/statsdisplay';
import { TraceHandler } from './handlers/tracehandler';
import { DeltaHandler } from './handlers/deltahandler';

class AlienAPIFiller {
    state_receiver: typeof StateReceiver;

    constructor (config, amq, stats) {
        console.log(`Constructing...`, config);

        const statereceiver_config = {
            eos: {
                wsEndpoint: config.ship_endpoints[0],
                chainId: config.chain_id,
                endpoint: config.endpoints[0]
            }
        }

        const trace_handler = new TraceHandler({config, amq, stats});
        const delta_handler = new DeltaHandler({config, amq, stats});

        this.state_receiver = new StateReceiver({
            startBlock: config.start_block,
            endBlock: 0xffffffff,
            mode: 0,
            config: statereceiver_config
        });
        this.state_receiver.registerTraceHandler(trace_handler);
        this.state_receiver.registerDeltaHandler(delta_handler);
        this.state_receiver.start();
    }

    start() {
        console.log(`Starting filler`);
    }
}



(async () => {
    const config = require(`./config`);

    const stats = new StatsDisplay();

    const amq = new Amq(config.amq);
    await amq.init();

    const api = new AlienAPIFiller(config, amq, stats);
    api.start();
})();
