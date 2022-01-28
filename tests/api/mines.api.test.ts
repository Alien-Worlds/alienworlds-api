import { createApiTestEnvironment } from '../environments';

const environment = createApiTestEnvironment();
environment.initialize();

jest.mock('mongodb');

describe('Mines API Test', () => {
  it('should return 200', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mines?land_id=1099512958747',
    });

    expect(response.statusCode).toEqual(200);
    console.log(response.payload);
    const payload = JSON.parse(response.payload);
    expect(payload.results[0].miner).toEqual('fakeminer1.wam');
  });

  it('should return Error if limit is > 5000', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mines?limit=6000',
    });

    expect(response.statusCode).toEqual(500);
  });

  it('should return Error if wrong sort was provided', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mines?sort=FAKE',
    });

    expect(response.statusCode).toEqual(500);
  });
});
