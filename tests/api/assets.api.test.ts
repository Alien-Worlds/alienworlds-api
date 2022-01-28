import { createApiTestEnvironment } from '../environments';

const environment = createApiTestEnvironment();
environment.initialize();

describe('Assets API Test', () => {
  it('should return 200', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/asset',
    });
    expect(response.statusCode).toEqual(200);
  });

  it('should return Error no asset by id is returned', async () => {
    const fakeAssetId = 0;
    const response = await environment.server.inject({
      method: 'GET',
      url: `/v1/alienworlds/asset?id=${fakeAssetId}`,
    });

    expect(response.statusCode).toEqual(404);
  });
});
