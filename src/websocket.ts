/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import axon from 'axon';
const sock = axon.socket('pub-emitter');
const StateReceiver = require('@eosdacio/eosio-statereceiver');
const { Api, JsonRpc } = require('eosjs');
const fetch = require('node-fetch');

class WSTraceHandler {
  config: any;
  sock: any;
  eos_rpc: typeof JsonRpc;
  eos_api: typeof Api;

  constructor({ config, sock }) {
    this.config = config;
    this.sock = sock;

    this.eos_rpc = new JsonRpc(config.endpoints[0], { fetch });
    this.eos_api = new Api({
      rpc: this.eos_rpc,
      signatureProvider: null,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    });
  }

  async processTrace(block_num, traces, block_timestamp) {
    for (const trace of traces) {
      switch (trace[0]) {
        case 'transaction_trace_v0':
          const trx = trace[1];

          for (let action of trx.action_traces) {
            switch (action[0]) {
              case 'action_trace_v0':
              case 'action_trace_v1':
                if (
                  action[1].act.account === this.config.atomicassets.contract
                ) {
                  const data: any = {};
                  let account: String = '';
                  if (action[1].act.name === 'logmint') {
                    data.action = 'mint';
                    data.block_num = block_num;
                    const deser = await this.eos_api.deserializeActions([
                      action[1].act,
                    ]);
                    data.data = deser[0].data;
                    account = data.data.new_asset_owner;
                  }
                  /*else if (action[1].act.name === 'logtransfer'){
                                        data.action = 'transfer';
                                        const deser = await this.eos_api.deserializeActions([action[1].act]);
                                        data.data = deser[0].data;
                                        account = data.data.to;
                                    }*/

                  if (
                    data.action &&
                    account &&
                    data.data.authorized_minter === 'm.federation' &&
                    data.data.collection_name === 'alien.worlds'
                  ) {
                    this.sock.emit(`asset:${account}`, data);
                    // Check to see if we send this as a test
                    const rand = Math.random();
                    if (rand < 0.1) {
                      this.sock.emit(`test:test`, data);
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

(async () => {
  const config = require(`./config`);

  const eos_rpc = new JsonRpc(config.endpoints[0], { fetch });
  const info = await eos_rpc.get_info();
  const startBlock = info.head_block_num;

  const statereceiver_config = {
    eos: {
      wsEndpoint: config.ship_endpoints[0],
      chainId: config.chain_id,
      endpoint: config.endpoints[0],
    },
  };

  sock.bind(3000);

  const trace_handler = new WSTraceHandler({ config, sock });
  const state_receiver = new StateReceiver({
    startBlock,
    config: statereceiver_config,
  });
  state_receiver.registerTraceHandler(trace_handler);
  state_receiver.start();
})();
