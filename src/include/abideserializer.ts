const nodeAbieos = require('@eosrio/node-abieos');

export class AbiDeserializer {
  abis: Array<any>;
  dir: String;
  loaded: Boolean;
  current_abi: String;

  constructor(dir) {
    this.dir = dir;
    this.loaded = false;
  }

  async load() {
    console.log(`Loading ABIs`);
    const fs = require('fs');

    const abi_temp = [];

    const abi_dir = fs.opendirSync(this.dir);
    for await (const file of abi_dir) {
      // console.log(file.name);
      const [contract, block_num_str] = file.name
        .replace(/\.hex$/, '')
        .split('-');
      const block_num = parseInt(block_num_str);
      console.log(`Loading ${this.dir}/${file.name}...`);
      const abi_hex = fs.readFileSync(`${this.dir}/${file.name}`, 'utf-8');
      abi_temp.push({
        contract,
        block_num,
        abi_hex,
        filename: file.name,
      });
    }

    this.abis = abi_temp.sort((a, b) => (a.block_num < b.block_num ? -1 : 1));

    console.log('Loaded ABIs');
    // console.log(this.abis);
    this.loaded = true;
  }

  load_abi(account, block_num, current_block = false) {
    // get abi from current or only previous block, it will depend on order of the action vs the updated code
    let abi_to_load = null;
    for (let a = 0; a < this.abis.length; a++) {
      if (this.abis[a].contract === account) {
        let matched = false;
        if (!current_block) {
          matched = block_num > this.abis[a].block_num;
        } else {
          matched = block_num >= this.abis[a].block_num;
        }

        if (matched) {
          abi_to_load = this.abis[a];
        } else {
          break;
        }
      }
    }

    if (this.current_abi != abi_to_load.filename) {
      // console.log(`Loading new ABI ${abi_to_load.filename}`);
      nodeAbieos.load_abi_hex(account, abi_to_load.abi_hex);
      this.current_abi = abi_to_load.filename;
    }
  }

  async deserialize_action(account, name, data, block_num = 0n) {
    this.load_abi(account, block_num);

    let type, json;

    try {
      type = nodeAbieos.get_type_for_action(account, name);
      json = nodeAbieos.bin_to_json(account, type, Buffer.from(data));
    } catch (e) {
      // try to load abi from current block
      this.load_abi(account, block_num, true);
      type = nodeAbieos.get_type_for_action(account, name);
      json = nodeAbieos.bin_to_json(account, type, Buffer.from(data));
    }

    return json;
  }

  async deserialize_table(account, name, data, block_num = 0n) {
    this.load_abi(account, block_num);

    let type, json;

    try {
      type = nodeAbieos.get_type_for_table(account, name);
      json = nodeAbieos.bin_to_json(account, type, Buffer.from(data));
    } catch (e) {
      // try to load abi from current block
      this.load_abi(account, block_num, true);
      type = nodeAbieos.get_type_for_table(account, name);
      json = nodeAbieos.bin_to_json(account, type, Buffer.from(data));
    }

    return json;
  }
}
