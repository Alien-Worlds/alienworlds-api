import { getJsonRpcProvider } from '../../src/api-handlers/api.ioc.utils';
import { createApiTestEnvironment } from '../environments';

jest.mock('ethers');
jest.mock('../../src/api-handlers/api.ioc.utils');
const getJsonRpcProviderMock = getJsonRpcProvider as jest.MockedFunction<
  typeof getJsonRpcProvider
>;
getJsonRpcProviderMock.mockResolvedValue({} as any);

const environment = createApiTestEnvironment();
environment.initialize();

describe('Mines API Test', () => {
  it('should return 200', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mines?land_id=1099512958747',
    });

    expect(response.statusCode).toEqual(200);
    const payload = JSON.parse(response.payload);
    expect(payload.results[0].miner).toEqual('fakeminer1.wam');
  });

  it('should return 400 and error message when limit is > 5000', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mines?limit=6000',
    });

    expect(response.statusCode).toEqual(400);
  });

  it('should return 400 if wrong sort value was provided', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mines?sort=FAKE',
    });

    expect(response.statusCode).toEqual(400);
  });
});
