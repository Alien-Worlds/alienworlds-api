/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Contract } from 'ethers';
import { getJsonRpcProvider } from '../../src/ioc/api.ioc.utils';
import { createApiTestEnvironment } from '../environments';

jest.mock('ethers');
jest.mock('../../src/ioc/api.ioc.utils');
const getJsonRpcProviderMock = getJsonRpcProvider as jest.MockedFunction<
  typeof getJsonRpcProvider
>;

const ContractMock = Contract as jest.MockedClass<typeof Contract>;

ContractMock.prototype.balanceOf = (address: string) =>
  Promise.resolve('12345.67890');

getJsonRpcProviderMock.mockResolvedValue({} as any);

const environment = createApiTestEnvironment();
environment.initialize();

describe('Token API Test', () => {
  it('Should return 400 when the type does not match "circulating" or "supply"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/token?type=Fake',
    });

    expect(response.statusCode).toEqual(400);
  });

  it('Should return circulating value when type is "circulating"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/token?type=circulating',
    });
    expect(response.statusCode).toEqual(200);
    expect(isNaN(parseFloat(response.body))).toBeFalsy();
  });

  it('Should return supply value when type is "supply"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/token?type=supply',
    });

    expect(response.statusCode).toEqual(200);
    expect(isNaN(parseFloat(response.body))).toBeFalsy();
  });
});
