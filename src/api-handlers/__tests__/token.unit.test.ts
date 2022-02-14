import {
  WaxService,
  ContractService,
  balanceReducer,
  getCirculatingSupply,
  getTokenSupplies,
  contractInterface,
} from '../token';
import { mockContractBalanceOf } from './mocks/token.mock';
import fetch from 'node-fetch';

jest.mock('node-fetch');
jest.mock('ethers');

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('"balanceReducer" unit tests', () => {
  it('Should decrease the initial value by the given numbers', async () => {
    const result = [10, 6, 24].reduce(balanceReducer, 100);
    expect(result).toEqual(60);
  });
  it('Should return the initial value when no numbers are given', async () => {
    const result = [].reduce(balanceReducer, 100);
    expect(result).toEqual(100);
  });
});

describe('WaxService unit tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('Should throw an error when no arguments are given', async () => {
    const action = () => {
      new WaxService(null);
    };
    expect(action).toThrowError();
  });

  it('"getCurrencyBalance" should return 0 when response is empty', async () => {
    mockFetch.mockResolvedValue({ json: () => '' });

    const service = new WaxService('test');
    const balance = await service.getCurrencyBalance('fakeaccount');
    expect(balance).toEqual(0);
  });

  it('"getCurrencyBalance" should return NaN when response does not contain numeric value', async () => {
    mockFetch.mockResolvedValue({ json: () => ['foobar'] });
    const service = new WaxService('test');
    const balance = await service.getCurrencyBalance('fakeaccount');
    expect(balance).toEqual(NaN);
  });

  it('"getCurrencyBalance" should return balance when response is not empty', async () => {
    mockFetch.mockResolvedValue({ json: () => ['100 TLM'] });
    const service = new WaxService('test');
    const balance = await service.getCurrencyBalance('fakeaccount');
    expect(balance).toEqual(100);
  });

  it('"getSupply" should throw an Error when response does not contain TLM data', async () => {
    mockFetch.mockResolvedValue({ json: () => '' });

    const service = new WaxService('test');
    await service.getSupply().catch(error => {
      expect(error).toBeInstanceOf(Error);
    });
  });

  it('"getSupply" should return balance when response is not empty', async () => {
    mockFetch.mockResolvedValue({
      json: () => ({ TLM: { supply: '100 TLM' } }),
    });
    const service = new WaxService('test');
    const balance = await service.getSupply();
    expect(balance).toEqual(100);
  });
});

describe('ContractService unit tests', () => {
  it('Should throw an error when no arguments are given', async () => {
    const action = () => {
      new ContractService(null, null, null);
    };
    expect(action).toThrowError();
  });

  it('"getBalance" should return balance divided by 10000', async () => {
    const service = new ContractService('endpoint', 'token', contractInterface);

    mockContractBalanceOf(service, 50000);

    const balance = await service.getBalance('fakeaddress');
    expect(balance).toEqual(5);
  });
});

describe('"getCirculatingSupply" unit tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('"getBalance" should return 0 when initial supply is 30000 and balances for excluded accounts are 30x1000', async () => {
    jest.spyOn(WaxService.prototype, 'getSupply').mockResolvedValue(30000);
    jest
      .spyOn(WaxService.prototype, 'getCurrencyBalance')
      .mockResolvedValue(1000);

    const waxService = new WaxService('test');
    const ethService = new ContractService(
      'endpoint',
      'token',
      contractInterface
    );
    const bscService = new ContractService(
      'endpoint',
      'token',
      contractInterface
    );

    mockContractBalanceOf(ethService, 10000000);
    mockContractBalanceOf(bscService, 10000000);

    const supply = await getCirculatingSupply(
      waxService,
      ethService,
      bscService
    );
    expect(supply).toEqual('0.0000');
  });
});

describe('"getTokenSupplies" unit tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('"getTokenSupplies" should return "Invalid type" when the given type is neither supply nor circulating', async () => {
    const supply = await getTokenSupplies(
      { query: { type: 'foo' } },
      new WaxService('endpoint'),
      new ContractService('endpoint', 'token', contractInterface),
      new ContractService('endpoint', 'token', contractInterface)
    );
    expect(supply).toEqual('Invalid type');
  });

  it('"getTokenSupplies" should return result of WaxService.getSupply when given type is "supply"', async () => {
    jest.spyOn(WaxService.prototype, 'getSupply').mockResolvedValue(1000);

    const supply = await getTokenSupplies(
      { query: { type: 'supply' } },
      new WaxService('endpoint'),
      new ContractService('endpoint', 'token', contractInterface),
      new ContractService('endpoint', 'token', contractInterface)
    );
    expect(supply).toEqual(1000);
  });

  it('"getTokenSupplies" should return value of the circulating supply when given type is "circulating"', async () => {
    jest.spyOn(WaxService.prototype, 'getSupply').mockResolvedValue(30000);
    jest.spyOn(ContractService.prototype, 'getBalance').mockResolvedValue(1000);

    const supply = await getTokenSupplies(
      { query: { type: 'circulating' } },
      new WaxService('endpoint'),
      new ContractService('endpoint', 'token', contractInterface),
      new ContractService('endpoint', 'token', contractInterface)
    );
    expect(supply).toEqual('0.0000');
  });
});
