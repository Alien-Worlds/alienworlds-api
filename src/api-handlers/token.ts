/* eslint-disable @typescript-eslint/no-var-requires */
import { tokenSchema } from '../schemas';
import fetch from 'node-fetch';
import { Contract, ContractInterface, providers } from 'ethers';
import { config } from '../config';

export const contractInterface = [
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    type: 'function',
  },
];
export const excludedWaxAccounts = [
  'team.worlds',
  'ghub.worlds',
  'fndtn.worlds',
  'oper2.worlds',
  'mm.worlds',
  'anim.worlds',
  'oper3.worlds',
  'oper1.worlds',
  'call.worlds',
  'sixpepvamshi',
  'iamababygirl',
  'careforchild',
  'doctormanasa',
  'emahalakshmi',
  'helloashwath',
  'idwarakaravi',
  'itstharshita',
  'mrsuryapavan',
  'realshirisha',
  'sriramsurya2',
  'thereallatha',
  'kavian.world',
  'neri.world',
  'magor.world',
  'open.worlds',
  'eyeke.world',
  'veles.world',
];
export const excludedEthAccounts = [
  '0xa0ea3f87922810c012db706e247636c71868ffbb',
  '0x3333336d579a0107849eb68c9f1c0b92d48c2889',
];
export const excludedBscAccounts = [
  '0x5903b5f7eb3733fec8477be1b0a0fd149b33b547',
];

/**
 * Represents the available /asset request query options
 * @type
 */
export type TokenRequestQueryOptions = {
  type?: 'circulating' | 'supply';
  offset?: number;
  id?: string;
  owner?: string;
  schema?: string;
};

/**
 * Class representing a WaxService instance.
 * WaxService is the data source responsible for communicating with the WAX endpoint API
 *
 * @class
 */
export class WaxService {
  private _balanceUrl: string;
  private _statsUrl: string;

  constructor(endpoint: string) {
    if (!endpoint) {
      throw new Error('Endpoint not specified');
    }

    this._balanceUrl = `${endpoint}/v1/chain/get_currency_balance`;
    this._statsUrl = `${endpoint}/v1/chain/get_currency_stats`;
  }

  /**
   * Gets the currency balance for the given account
   *
   * @async
   * @param {string} account wax account name
   * @returns {number} balance
   */
  public async getCurrencyBalance(account: string): Promise<number> {
    const res = await fetch(this._balanceUrl, {
      method: 'POST',
      body: JSON.stringify({
        account,
        code: 'alien.worlds',
        symbol: 'TLM',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();

    if (!json || json.length == 0) {
      return 0;
    }

    const [bal_str] = json[0].split(' ');

    return parseFloat(bal_str);
  }

  /**
   * Gets the value of supply from the current currency statistics
   *
   * @async
   * @returns {number} supply
   */
  public async getSupply(): Promise<number> {
    const res = await fetch(this._statsUrl, {
      method: 'POST',
      body: JSON.stringify({
        json: true,
        code: 'alien.worlds',
        symbol: 'TLM',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    return parseFloat(json.TLM.supply.replace(' TLM', ''));
  }
}

/**
 * Class representing a ContractService instance.
 * ContractService is the Ethers data source
 * responsible for communicating with the Contract on-chain
 *
 * @class
 * @see {@link https://docs.ethers.io/v5/api/contract/contract} for further information about the Contract class.
 */
export class ContractService {
  private provider: providers.JsonRpcProvider;
  private contract: Contract;

  /**
   * Creates instance of the ContractService attached to the given endpoint.
   *
   * @constructor
   * @param {string} endpoint
   * @param {string} token
   * @param {ContractInterface} contractInterface
   */
  constructor(
    endpoint: string,
    token: string,
    contractInterface: ContractInterface
  ) {
    if (!endpoint || !token || !contractInterface) {
      throw new Error('One or more arguments were not specified');
    }

    this.provider = new providers.JsonRpcProvider(endpoint);
    this.contract = new Contract(token, contractInterface, this.provider);
  }

  /**
   * Get balance of the given account
   *
   * @async
   * @param {string} address account address
   * @returns {number} balance
   */
  public async getBalance(address: string): Promise<number> {
    const balance = await this.contract.balanceOf(address);
    return balance.toNumber() / 10000;
  }
}

/**
 * Array reducer which decreases the initial value by the given current value
 *
 * @param {number} initial
 * @param {number} value
 * @returns {number}
 */
export const balanceReducer = (initial: number, value: number) =>
  initial - value;

/**
 * Gets circulating supply
 *
 * @async
 * @param {WaxService} waxService
 * @param {ContractService} ethContractService
 * @param {ContractService} bscContractService
 * @returns {string}
 */
export const getCirculatingSupply = async (
  waxService: WaxService,
  ethContractService: ContractService,
  bscContractService: ContractService
): Promise<string> => {
  const supply = await waxService.getSupply();
  const waxBalances = await Promise.all(
    excludedWaxAccounts.map(
      async account => await waxService.getCurrencyBalance(account)
    )
  );
  const ethBalances = await Promise.all(
    excludedEthAccounts.map(
      async account => await ethContractService.getBalance(account)
    )
  );
  const bscBalances = await Promise.all(
    excludedBscAccounts.map(
      async account => await bscContractService.getBalance(account)
    )
  );

  return [...waxBalances, ...ethBalances, ...bscBalances]
    .reduce(balanceReducer, supply)
    .toFixed(4);
};

/**
 * Fetch current or circulating supply
 *
 * @async
 * @param {Fastify} fastify
 * @param {Request} request
 * @param {WaxService} waxService
 * @param {ContractService} ethContractService
 * @param {ContractService} bscContractService
 * @returns
 */
export const getTokenSupplies = async (
  request,
  waxService: WaxService,
  ethContractService: ContractService,
  bscContractService: ContractService
) => {
  const { type }: TokenRequestQueryOptions = request.query || {};

  if (type == 'supply') {
    return waxService.getSupply();
  }

  if (type == 'circulating') {
    return getCirculatingSupply(
      waxService,
      ethContractService,
      bscContractService
    );
  }

  return 'Invalid type';
};

/**
 * GET "/token" route declaration method
 *
 * @default
 * @param opts route options
 * @param next
 */
export default function (fastify, opts, next) {
  fastify.get(
    '/token',
    {
      schema: tokenSchema.GET,
    },
    async (request, reply) => {
      const waxService = new WaxService(config.endpoints[0]);
      const ethContractService = new ContractService(
        config.ethEndpoint,
        config.ethTokenContract,
        contractInterface
      );
      const bscContractService = new ContractService(
        config.bscEndpoint,
        config.bscTokenContract,
        contractInterface
      );
      const res = await getTokenSupplies(
        request,
        waxService,
        ethContractService,
        bscContractService
      );
      reply.send(res);
    }
  );
  next();
}
